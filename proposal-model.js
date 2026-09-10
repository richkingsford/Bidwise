/* Shared, unit-tested proposal arithmetic. All commercial assumptions live in the JSON catalog or proposal state. */
(function (root) {
  const clamp = (v, min, max) => Math.max(min, Math.min(max, v));
  const finite = (v, fallback) => Number.isFinite(Number(v)) ? Number(v) : fallback;
  function evaluate(state, config = {}) {
    const ev = state.ev, capital = finite(state.investment.ev, 0);
    const ports = Math.max(1, finite(ev.ports, 8)), days = Math.max(1, finite(ev.daysPerYear, 365));
    const sessions = ports * 1440 * Math.max(0, ev.forecastYear5Utilization) / 100 / Math.max(1, ev.averageSessionMinutes);
    const energy = Math.max(0, ev.energyPerSessionKwh), price = Math.max(0, ev.chargingPricePerKwh);
    const revenue = sessions * energy * price * days;
    const demandKw = Math.max(0, finite(ev.billedDemandKw, config.billedDemandKw ?? 150));
    const demandRate = finite(ev.demandRatePerKwMonth, 12.71), facilitiesRate = finite(ev.facilitiesRatePerKwMonth, 4.14);
    const customerCharge = finite(ev.customerChargePerMonth, 55);
    const energyCost = sessions * energy * ev.utilityEnergyCostPerKwh * days;
    const demandCost = demandKw * (demandRate + facilitiesRate) * 12 + customerCharge * 12;
    const costs = [
      {key:'network',label:'Tesla network fee',annual:sessions * finite(ev.networkFeePerSession, config.networkFeePerSession ?? 3) * days},
      {key:'power',label:'Power, demand & facilities',annual:energyCost + demandCost},
      {key:'operations',label:'Installer operations & support',annual:sessions * finite(ev.operationsPerSession, config.operationsPerSession ?? 1.8) * days},
      {key:'processing',label:'Payment processing',annual:revenue * finite(ev.processingPercent, config.processingPercent ?? 3) / 100}
    ];
    const expenses = costs.reduce((sum, row) => sum + row.annual, 0), income = revenue - expenses;
    const components = {
      chargingGap: clamp(ev.competitorCongestionScore * 10,0,100), roadAudience: clamp(ev.dailyTraffic / 70000 * 100,0,100),
      evAdoption: clamp(ev.currentBevPopulation / 20000 * 100,0,100), amenities: clamp(ev.amenityScore / 20 * 100,0,100),
      corridorAccess: clamp(100 - ev.travelRouteDistance * 20,0,100), hostFit: clamp(ev.entryExitScore * 10,0,100)
    };
    const weights = config.scoreWeights || {chargingGap:.2,roadAudience:.2,evAdoption:.15,amenities:.15,corridorAccess:.1,hostFit:.2};
    const score = Object.keys(weights).reduce((sum,key)=>sum+components[key]*weights[key],0);
    // The workbook labels this weighted 0–100 result as GetEV Score / 100;
    // expose the same score on the requested 1–10 sales scale as well.
    const getevScore = score / 10;
    // Workbook Utilization Model J5 and Lease Model K4/L4; repair reserve is not modeled.
    const combinedScore = (finite(ev.evpinScore,3.5)*20 + score)/2;
    const leaseUtilization = clamp(.2+(combinedScore-60)*.002, .18,.28);
    const leaseSessions = ports*1440*leaseUtilization/Math.max(1,ev.averageSessionMinutes);
    const variableCostPerSession = costs.filter(c=>c.key!=='power').reduce((sum,c)=>sum+c.annual,0)/(sessions*days || 1)+energy*ev.utilityEnergyCostPerKwh;
    const leaseIncome = leaseSessions*days*(energy*price-variableCostPerSession)-demandCost;
    const leaseCapacity = Math.max(0,leaseIncome-capital*(config.targetReturn ?? .12));
    const leasePerPortMonth = Math.floor(leaseCapacity/ports/12/25)*25;
    const leaseAnnual = leasePerPortMonth*ports*12;
    const paybackYears = income > 0 ? capital/income : null;
    return {ports,days,sessions,energy,price,capital,revenue,costs,expenses,income,energyCost,demandCost,score,getevScore,components,leaseUtilization,leaseCapacity,leasePerPortMonth,leaseAnnual,paybackYears};
  }
  function ranges(state, config={}) {
    const ev=state.ev, visits=ev.ports*1440*ev.forecastYear5Utilization/100/Math.max(1,ev.averageSessionMinutes);
    return ['conservative','expected','high'].map((key,i)=>{
      const capture=[ev.lowGuestCaptureRate,ev.restaurantCaptureRate,ev.highGuestCaptureRate][i];
      // Slide 4 defines the capture cases; Slide 8 uses the same assumptions
      // and the same expected ticket so the two slides reconcile exactly.
      const spend=ev.averageReceipt;
      const captures=[clamp(capture,0,100),clamp(capture,0,100)], spends=[Math.max(0,spend),Math.max(0,spend)];
      const parties=captures.map(c=>visits*c/100), daily=parties.map((p,j)=>p*spends[j]);
      return {key,captures,spends,parties,daily,monthly:daily.map(v=>v*30.42),annual:daily.map(v=>v*ev.daysPerYear)};
    });
  }
  root.GetEVProposalModel={evaluate,ranges};
  if (typeof module !== 'undefined') module.exports=root.GetEVProposalModel;
})(typeof window === 'undefined' ? globalThis : window);
