import unittest
from app.engine import REGIONS, compare, forecast

class CrowdFlowEngineTests(unittest.TestCase):
    def test_seven_regions_and_capacity_bounds(self):
        self.assertEqual(len(REGIONS), 7)
        for region in REGIONS:
            self.assertGreater(region['capacity'], 0)
            self.assertLessEqual(region['current'], region['capacity'])
            self.assertTrue(all(v['occupancy'] <= region['capacity'] for v in forecast(region)))

    def test_forecast_horizons(self):
        r=REGIONS[0]
        self.assertEqual([v['minutes'] for v in forecast(r)], [5,10,15])
        self.assertEqual(forecast(r)[0]['occupancy'], 56)

    def test_six_scenarios_and_network_flow_balance(self):
        result=compare()
        self.assertEqual([s['key'] for s in result['scenarios']], list('ABCDEF'))
        for scenario in result['scenarios']:
            flow=scenario['flowBalance']
            self.assertEqual(flow['start'], flow['remaining']+flow['served']+flow['held'])
            self.assertGreaterEqual(scenario['predicted'], 0)
            self.assertLessEqual(scenario['predicted'], 80)

    def test_rejects_ineligible_destination_and_resources(self):
        with self.assertRaises(ValueError): compare('library','services')
        with self.assertRaises(ValueError): compare(counters=99)
        with self.assertRaises(ValueError): compare(ratio=1)

if __name__ == '__main__': unittest.main()
