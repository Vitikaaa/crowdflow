import json, os
from pathlib import Path
from datetime import datetime, timezone
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from .engine import REGIONS, LABELS, compare, forecast

app=FastAPI(title='CrowdFlow Prototype API',version='1.0.0')
app.add_middleware(CORSMiddleware,allow_origins=os.getenv('CORS_ORIGINS','http://localhost:5173,http://127.0.0.1:5173').split(','),allow_methods=['*'],allow_headers=['*'])
STATE=Path(os.getenv('CROWDFLOW_STATE_FILE',str(Path(__file__).parent/'state.json')))
DEFAULT={'thresholds':{'moderate':40,'high':70,'critical':90},'horizon':15,'resources':{'counters':2,'staff':8},'capacities':{r['id']:r['capacity'] for r in REGIONS},'alerts':[], 'interventions':[]}
def read_state():
    try: return {**DEFAULT,**json.loads(STATE.read_text(encoding='utf8'))}
    except (OSError,ValueError): return json.loads(json.dumps(DEFAULT))
def write_state(s): STATE.parent.mkdir(parents=True,exist_ok=True); STATE.write_text(json.dumps(s,indent=2),encoding='utf8')
class ScenarioInput(BaseModel):
    regionId:str='canteen-a'; destinationId:str='canteen-b'; ratio:float=Field(.25,ge=0,le=.8); counters:int=Field(1,ge=0); staff:int=Field(1,ge=0); horizon:int=Field(15,ge=5,le=15)
class Settings(BaseModel):
    thresholds:dict[str,int]; horizon:int=Field(15,ge=5,le=15); resources:dict[str,int]; capacities:dict[str,int]
class Intervention(BaseModel):
    region:str; scenario:str=Field(pattern='^[A-F]$'); decision:str=Field('approve',pattern='^(approve|reject)$')
@app.get('/health')
def health(): return {'status':'ok','source':'synthetic prototype'}
@app.get('/api/regions')
def regions():
    state=read_state(); caps=state['capacities']
    return [dict(**r,capacity=caps.get(r['id'],r['capacity']),thresholds=state['thresholds'],approaching=round(r['arrivals']*5),pred={str(x['minutes']):x['occupancy'] for x in forecast({**r,'capacity':caps.get(r['id'],r['capacity'])})},confidence=None,source='synthetic simulation',updatedAt=datetime.now(timezone.utc).isoformat()) for r in REGIONS]
@app.get('/api/counterfactual')
def counterfactual(): return compare()
@app.post('/api/scenarios/compare')
def scenarios(payload:ScenarioInput):
    try:
        state=read_state()
        return compare(payload.regionId,payload.destinationId,payload.ratio,payload.counters,payload.staff,payload.horizon,state['resources'],state['capacities'])
    except ValueError as e:raise HTTPException(422,str(e))
@app.get('/api/alerts')
def alerts():
    state=read_state()
    if not state['alerts']:
        state['alerts']=[dict(id='alert-canteen-a',regionId='canteen-a',severity='high',title='Simulated crowd threshold exceeded',detail='Synthetic occupancy is above configured high threshold.',time='Current prototype snapshot',status='active')]
        write_state(state)
    return state['alerts']
@app.post('/api/alerts/{alert_id}/{action}')
def update_alert(alert_id:str,action:str):
    if action not in ('acknowledge','dismiss'): raise HTTPException(422,'Action must be acknowledge or dismiss')
    state=read_state(); alert=next((a for a in state['alerts'] if str(a['id'])==alert_id),None)
    if not alert: raise HTTPException(404,'Alert not found')
    alert['status']=action; write_state(state); return alert
@app.get('/api/feedback')
def feedback(): return {'sampleCount':0,'mae':None,'rmse':None,'lastError':None,'note':'No valid timestamped observation pairs; forecast metrics are not available.'}
@app.get('/api/analytics')
def analytics(): return {'sampleCount':0,'window':None,'mae':None,'rmse':None,'residuals':[],'missingObservations':0,'note':'No valid actual observations are stored; simulation data is excluded from validation.'}
@app.get('/api/settings')
def get_settings(): return {k:read_state()[k] for k in ('thresholds','horizon','resources','capacities')}
@app.put('/api/settings')
def put_settings(settings:Settings):
    t=settings.thresholds
    if set(t)!={'moderate','high','critical'} or not 0<t['moderate']<t['high']<t['critical']<=200: raise HTTPException(422,'Thresholds must increase from moderate to critical (max 200).')
    if set(settings.resources)!={'counters','staff'} or any(v<0 for v in settings.resources.values()): raise HTTPException(422,'Resources must include nonnegative counters and staff.')
    if set(settings.capacities)!={r['id'] for r in REGIONS} or any(v < next(r['current'] for r in REGIONS if r['id']==k) for k,v in settings.capacities.items()): raise HTTPException(422,'Set a capacity at least equal to current occupancy for every configured region.')
    state=read_state(); state.update(settings.model_dump()); write_state(state); return get_settings()
@app.post('/api/interventions')
def intervention(body:Intervention):
    if body.region not in {r['id'] for r in REGIONS}: raise HTTPException(422,'Unknown region')
    state=read_state(); item={'id':len(state['interventions'])+1,**body.model_dump(),'status':'simulated preview only','createdAt':datetime.now(timezone.utc).isoformat()}; state['interventions'].append(item); write_state(state); return item
