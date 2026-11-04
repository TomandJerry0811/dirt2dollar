"""Dedicated loopback test server. Real src.main routes/controllers/workflows;
only the external provider boundaries are replaced. Never deploy this entrypoint.
Run with requirements-playwright.txt. Production src.main has no test endpoints.
"""
import copy
import json
from threading import RLock
from unittest.mock import patch
from fastapi import Body
from src.core.exceptions import ProviderException
from src.providers.db.supabase_provider import SupabaseProvider
from src.providers.llm.groq_provider import GroqProvider
from src.providers.external.google_sheet_provider import GoogleSheetsProvider
from src.providers.embeddings.huggingface_provider import HuggingFaceProvider

lock = RLock()
state = {}

def reset(fail_llm=False):
    with lock:
        state.clear()
        state.update(tables={}, calls=[], llm_failure=fail_llm)
        state['tables']['client_updates'] = [
            {'id': i, 'client_id': f'integration-{i}',
             'client_name': 'Yardworx Controlled Client' if i == 1 else f'Yardworx Control {i:02}',
             'churn_probability': 75 if i % 2 else 10,
             'satisfaction_score': 25 if i % 2 else 90,
             'summary': f'Controlled existing summary {i}',
             'flags': [], 'bottlenecks': [], 'action_items': [],
             'timestamp': '2026-01-02T10:00:00Z'}
            for i in range(1, 26)
        ]

reset()

def database(_self, operation, table='', **kwargs):
    with lock:
        state['calls'].append({'provider': 'database', 'operation': operation, 'table': table,
                               'function': kwargs.get('function_name')})
        rows = state['tables'].setdefault(table, [])
        filters = kwargs.get('filters', {})
        matching = [row for row in rows if all(str(row.get(k)) == str(v) for k, v in filters.items())]
        if operation == 'select': return copy.deepcopy(matching)
        if operation == 'rpc':
            vector = kwargs.get('parameters', {}).get('query_embedding', [])
            if len(vector) != 768: raise ProviderException('Invalid test vector dimension')
            return [{'id': 'historical-control', 'client_id': 'historical-client',
                     'client_name': 'Controlled Historical Client', 'similarity': 0.87,
                     'summary': 'Historical engagement decline.', 'churn_probability': 80,
                     'metadata': {'client_id': 'historical-client', 'client_name': 'Controlled Historical Client'}}]
        if operation == 'insert':
            data = kwargs['data']; data = data if isinstance(data, list) else [data]
            added = []
            for item in data:
                record = {**copy.deepcopy(item), 'id': len(rows) + 100}
                rows.append(record); added.append(record)
            return copy.deepcopy(added)
        if operation == 'update':
            for row in matching: row.update(copy.deepcopy(kwargs['data']))
            return copy.deepcopy(matching)
        if operation == 'delete':
            state['tables'][table] = [row for row in rows if row not in matching]
            return copy.deepcopy(matching)
        raise AssertionError(f'Unexpected database operation: {operation}')

def llm(_self, **kwargs):
    with lock:
        state['calls'].append({'provider': 'llm', 'system_prompt': kwargs.get('system_prompt', '')[:100]})
        if state['llm_failure']: raise ProviderException('Controlled provider outage')
    # Each real node parses/validates the subset it requires from this controlled response.
    payload = {'client_name': 'Yardworx Controlled Client', 'client_id': 'integration-1',
               'summary': 'Controlled generated summary: client engagement declined.',
               'satisfaction_score': 20, 'probability': 80,
               'analysis': 'Controlled analysis: retention intervention is required.',
               'red_flags': ['Declining engagement'], 'bottlenecks': ['Low conversion'],
               'historical_insights': [], 'recommendations': ['Schedule a controlled retention call.'],
               'overall_health': 'At Risk', 'business_summary': 'Controlled KPI interpretation.',
               'positive_signals': [], 'risk_factors': ['Low engagement']}
    return {'content': json.dumps(payload), 'usage': {'prompt_tokens': 10, 'completion_tokens': 20, 'total_tokens': 30}, 'model': 'controlled-test-model'}

def sheet(_self, client_name='Yardworx Controlled Client'):
    with lock: state['calls'].append({'provider': 'sheets', 'client': client_name})
    if client_name.casefold() != 'yardworx controlled client': return None
    data = {'clientId': 'integration-1', 'clientName': 'Yardworx Controlled Client',
            'programType': 'Test Program', 'programDuration': '12 months',
            'programStage': 'Active', 'campaignStatus': 'Active',
            'currentSatisfaction': 20, 'spend7D': 100, 'leads7D': 5, 'appts7D': 2,
            'updates': [{'created_at': '2026-01-02T10:00:00Z', 'creator_name': 'Test Analyst',
                         'body': 'Client engagement declined and a retention call is needed.'}]}
    return {'Client_name': 'Yardworx Controlled Client', 'Updates': json.dumps([data])}

def init_embedding(self):
    self.expected_dimension = 768

def embedding(_self, text):
    with lock: state['calls'].append({'provider': 'embedding', 'characters': len(text)})
    return {'embedding': [1.0] + [0.0] * 767, 'dimension': 768, 'model': 'controlled-embedding'}

# Patches are installed before importing src.main, which constructs its controllers.
# Neither controller.analyze nor orchestrator.run nor any workflow node is stubbed.
patches = [patch.object(SupabaseProvider, 'execute', database),
           patch.object(GroqProvider, 'execute', llm),
           patch.object(GoogleSheetsProvider, 'get_client', sheet),
           patch.object(GoogleSheetsProvider, 'get_all_records', lambda self: [sheet(self)]),
           patch.object(HuggingFaceProvider, '__init__', init_embedding),
           patch.object(HuggingFaceProvider, 'generate_embedding', embedding)]
for item in patches: item.start()
from src.main import app

@app.post('/__test__/reset')
def reset_endpoint(options: dict = Body(default={})):
    reset(bool(options.get('fail_llm', False)))
    return {'status': 'reset'}

@app.get('/__test__/state')
def inspect_state():
    with lock: return copy.deepcopy(state)
