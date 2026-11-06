import base64
import os
import tempfile
from pathlib import Path
import pytest
from fastapi.testclient import TestClient

# Los tests deben poder ejecutarse sin .env, sin crear datos en la carpeta real.
os.environ['DEMO_MODE'] = 'true'
os.environ['DATA_DIR'] = tempfile.mkdtemp(prefix='sena-test-data-')
import main

@pytest.fixture
def client(tmp_path, monkeypatch):
    monkeypatch.setattr(main,'DB_PATH',tmp_path/'test.db')
    monkeypatch.setattr(main,'FILES',tmp_path/'files')
    main.FILES.mkdir(parents=True,exist_ok=True)
    monkeypatch.setattr(main,'DEMO_MODE',True)
    with TestClient(main.app) as client:
        yield client

def login(client, username, role):
    r=client.post('/auth/login',json={'username':username,'password':'SenaDemo2026!','role':role})
    assert r.status_code==200, r.text
    return {'Authorization':f"Bearer {r.json()['access_token']}"}

def test_auth_and_filtered_data(client):
    assert client.get('/datos').status_code==401
    assert client.post('/auth/login',json={'username':'superadmin','password':'mala','role':'admin'}).status_code==401
    assert client.post('/auth/login',json={'username':'superadmin','password':'SenaDemo2026!','role':'aprendiz'}).status_code==401
    admin=login(client,'superadmin','admin')
    inst=login(client,'instructor','instructor')
    learner=login(client,'1033782941','aprendiz')
    assert len(client.get('/datos',headers=admin).json()['aprendices']) == 6
    assert len(client.get('/datos',headers=learner).json()['aprendices']) == 1
    assert len(client.get('/datos',headers=inst).json()['aprendices']) == 6

def test_crud_and_permissions(client):
    admin=login(client,'superadmin','admin')
    learner=login(client,'1033782941','aprendiz')
    fich = client.get('/datos',headers=admin).json()['fichas'][0].copy()
    fich['id']='ficha-nueva'; fich['numero']='9999999'
    assert client.post('/fichas',headers=learner,json={'data':fich}).status_code==403
    assert client.post('/fichas',headers=admin,json={'data':fich}).status_code==201
    fich['programa']='Programa actualizado'
    assert client.put('/fichas/ficha-nueva',headers=admin,json={'data':fich}).status_code==200
    assert client.delete('/fichas/ficha-1',headers=admin).status_code==409
    assert client.delete('/fichas/ficha-nueva',headers=admin).status_code==204

def test_document_review_and_revocation(client):
    learner=login(client,'1033782941','aprendiz')
    instructor=login(client,'instructor','instructor')
    other=login(client,'1020485912','aprendiz')
    p=base64.b64encode(b'%PDF-1.5\n1 0 obj\n').decode()
    payload={'nombreArchivo':'prueba.pdf','formato':'pdf','periodo':'Q2','horas':80,'actividades':['Prueba'],'dataUrl':'data:application/pdf;base64,'+p}
    assert client.post('/aprendices/apr-2/items/B12/upload',headers=other,json=payload).status_code==403
    r=client.post('/aprendices/apr-2/items/B12/upload',headers=learner,json=payload)
    assert r.status_code==200, r.text
    assert r.json()['items']['B12']['estado']=='pendiente'
    assert client.get('/aprendices/apr-2/items/B12/archivo',headers=learner).status_code==200
    assert client.get('/aprendices/apr-2/items/B12/archivo',headers=other).status_code==403
    assert client.post('/aprendices/apr-2/items/B12/revision',headers=learner,json={'estado':'aprobado'}).status_code==403
    assert client.post('/aprendices/apr-2/items/B12/revision',headers=instructor,json={'estado':'rechazado','observaciones':''}).status_code==422
    assert client.post('/aprendices/apr-2/items/B12/revision',headers=instructor,json={'estado':'aprobado'}).status_code==200
    assert client.post('/aprendices/apr-2/paz-y-salvo',headers=instructor).status_code==409

def test_clearance_revoked_on_rejection(client):
    inst=login(client,'instructor','instructor')
    r=client.post('/aprendices/apr-1/paz-y-salvo',headers=inst)
    assert r.status_code==200, r.text
    assert r.json()['pazYSalvoGenerado'] is True
    rejected=client.post('/aprendices/apr-1/items/B1/revision',headers=inst,json={'estado':'rechazado','observaciones':'Revisión requerida'})
    assert rejected.status_code==200
    assert rejected.json()['pazYSalvoGenerado'] is False
    assert client.post('/aprendices/apr-1/paz-y-salvo',headers=inst).status_code==409
