"""Route-level tests, run after installing backend/requirements.txt."""
import tempfile
import unittest
from pathlib import Path
from fastapi import HTTPException
from app import main

class ApiRouteTests(unittest.TestCase):
    def setUp(self):
        self.tmp=tempfile.TemporaryDirectory()
        self.old=main.STATE
        main.STATE=Path(self.tmp.name)/'state.json'

    def tearDown(self):
        main.STATE=self.old
        self.tmp.cleanup()

    def test_region_route_and_horizon_schema(self):
        result=main.regions()
        self.assertEqual(len(result),7)
        self.assertEqual(set(result[0]['pred']),{'5','10','15'})
        self.assertEqual(main.feedback()['sampleCount'],0)

    def test_comparison_route_and_invalid_destination(self):
        result=main.scenarios(main.ScenarioInput())
        self.assertEqual([x['key'] for x in result['scenarios']],list('ABCDEF'))
        with self.assertRaises(HTTPException):
            main.scenarios(main.ScenarioInput(regionId='library',destinationId='services'))

    def test_alert_acknowledgement_persists(self):
        alert=main.alerts()[0]
        self.assertEqual(main.update_alert(alert['id'],'acknowledge')['status'],'acknowledge')
        self.assertEqual(main.alerts()[0]['status'],'acknowledge')
        with self.assertRaises(HTTPException): main.update_alert(alert['id'],'send')

    def test_settings_validation_and_persistence(self):
        current=main.get_settings()
        payload={**current,'thresholds':{'moderate':45,'high':75,'critical':95}}
        updated=main.put_settings(main.Settings(**payload))
        self.assertEqual(updated['thresholds']['high'],75)
        with self.assertRaises(HTTPException):
            main.put_settings(main.Settings(**{**updated,'thresholds':{'moderate':90,'high':70,'critical':95}}))

if __name__ == '__main__': unittest.main()
