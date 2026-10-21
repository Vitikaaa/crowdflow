"""Transparent deterministic queueing/crowd prototype; values are synthetic."""
from copy import deepcopy

REGIONS = [
    dict(id='canteen-a', name='Canteen A', capacity=80, current=42, arrivals=2.9, departures=0.0, neighbors=['canteen-b','student-hub']),
    dict(id='canteen-b', name='Canteen B', capacity=80, current=22, arrivals=0.7, departures=0.0, neighbors=['canteen-a','library']),
    dict(id='library', name='Library', capacity=150, current=96, arrivals=0.6, departures=0.1, neighbors=['canteen-b','printing']),
    dict(id='printing', name='Printing Centre', capacity=30, current=9, arrivals=0.2, departures=0.0, neighbors=['library','services']),
    dict(id='services', name='Student Services', capacity=40, current=15, arrivals=0.2, departures=0.0, neighbors=['printing','student-hub']),
    dict(id='main-gate', name='Main Gate', capacity=200, current=54, arrivals=1.0, departures=0.0, neighbors=['student-hub']),
    dict(id='student-hub', name='Student Hub', capacity=100, current=37, arrivals=0.6, departures=0.0, neighbors=['canteen-a','services','main-gate']),
]
HORIZONS = [5, 10, 15]
LABELS = {'A':'No intervention','B':'Redirect demand','C':'Open an additional counter','D':'Deploy response staff','E':'Meter entry','F':'Redirect demand + additional counter'}

def forecast(region, minutes=15):
    return [dict(minutes=h, occupancy=max(0, min(region['capacity'], round(region['current'] + (region['arrivals']-region['departures'])*h)))) for h in HORIZONS if h <= minutes]

def compare(target_id='canteen-a', destination_id='canteen-b', ratio=0.25, counters=1, staff=1, horizon=15, resources=None, capacities=None):
    by_id = {r['id']:r for r in REGIONS}
    if target_id not in by_id or destination_id not in by_id or target_id == destination_id: raise ValueError('Choose two distinct configured regions')
    target, dest = deepcopy(by_id[target_id]), deepcopy(by_id[destination_id])
    capacities=capacities or {}
    target['capacity']=capacities.get(target_id,target['capacity']); dest['capacity']=capacities.get(destination_id,dest['capacity'])
    if destination_id not in target['neighbors']: raise ValueError('Destination is not connected to target')
    if not 0 <= ratio <= 0.8: raise ValueError('ratio must be between 0 and 0.8')
    resources = resources or {'counters':2,'staff':8}
    if counters < 0 or staff < 0 or counters > resources['counters'] or staff > resources['staff']: raise ValueError('Requested resources exceed available resources')
    arrivals = target['arrivals'] * horizon
    diverted = round(arrivals * ratio)
    results=[]
    for key in LABELS:
        diversion = diverted if key in ('B','F') else 0
        transit = round(diversion * min(1, 5/horizon))
        arrived = diversion - transit
        metered = round(arrivals*0.6) if key == 'E' else 0
        # Counters change service throughput (queue accumulation), never room capacity.
        service = min(arrivals, counters*0.5*horizon) if key in ('C','F') else 0
        staff_effect = min(arrivals*0.1, staff*0.5) if key == 'D' else 0
        net_target = round(target['current'] + arrivals - target['departures']*horizon - diversion - metered - service - staff_effect)
        net_dest = round(dest['current'] + dest['arrivals']*horizon + arrived)
        target_final = min(target['capacity'], max(0, net_target))
        dest_final = min(dest['capacity'], max(0, net_dest))
        target_overflow=max(0,net_target-target['capacity']); dest_overflow=max(0,net_dest-dest['capacity'])
        # Network stock balance: all source arrivals end occupied, served, metered, or queued at capacity.
        external_queue = metered + target_overflow + dest_overflow + transit
        served = max(0, round(target['current']+dest['current']+arrivals+dest['arrivals']*horizon-target_final-dest_final-external_queue))
        results.append(dict(key=key,label=LABELS[key],predicted=target_final,destinationPredicted=dest_final,
          targetTrajectory=forecast({**target,'arrivals':max(0,(target['arrivals']-diversion/horizon-metered/horizon-service/horizon-staff_effect/horizon))},horizon),
          downstream=f'{dest["name"]}: {dest_final}/{dest["capacity"]}; redirected demand has a {5}-minute illustrative transit delay',
          redirected=diversion, transit=transit, externalQueue=external_queue, served=served, resourceCost={'counters':counters if key in ('C','F') else 0,'staff':staff if key=='D' else 0},
          feasible=target_overflow == 0 and dest_overflow == 0 and (key not in ('C','F') or counters > 0) and (key != 'D' or staff > 0),
          capacityOverflow=target_overflow+dest_overflow,
          flowBalance=dict(start=target['current']+dest['current']+arrivals+dest['arrivals']*horizon, remaining=target_final+dest_final, served=served, held=external_queue)))
    return dict(regionId=target_id,destinationId=destination_id,horizon=horizon,selected='A',scenarios=results,
      assumptions=['Synthetic steady arrival/departure rates are extended over the horizon.', 'Redirected demand arrives at the eligible neighboring destination after an illustrative 5 minute delay.', 'An added counter affects service throughput, not physical occupancy capacity.', 'Metered people are counted in an external queue and remain in network accounting.', 'Staff effect is a small stated throughput assumption; no real dispatch occurs.'])
