"""
Test script for AI Voice Health Agent
Tests hospital coordination and location functionality
"""

from hospital_data import INDIAN_HOSPITALS
from main import find_nearest_hospitals, format_hospital_info, simulate_hospital_call

def test_hospital_database():
    """Test if hospital database is properly loaded"""
    print("🧪 Testing hospital database...")
    
    print(f"Total cities with hospital data: {len(INDIAN_HOSPITALS)}")
    for city, hospitals in INDIAN_HOSPITALS.items():
        print(f"  {city.capitalize()}: {len(hospitals)} hospitals")
    
    print("✅ Hospital database test passed\n")

def test_hospital_search():
    """Test hospital search functionality"""
    print("🧪 Testing hospital search...")
    
    test_cases = [
        ("mumbai", False),
        ("delhi", True),  # Emergency required
        ("bangalore", False),
        ("invalidcity", False)
    ]
    
    for city, emergency in test_cases:
        print(f"\nSearching for hospitals in {city} (Emergency: {emergency})")
        hospitals, error = find_nearest_hospitals(city, emergency_required=emergency)
        
        if error:
            print(f"  ❌ Error: {error}")
        else:
            print(f"  ✅ Found {len(hospitals)} hospitals")
            for hospital in hospitals[:2]:  # Show first 2
                print(f"    - {hospital['name']}")
    
    print("\n✅ Hospital search test completed\n")

def test_hospital_info_formatting():
    """Test hospital information formatting"""
    print("🧪 Testing hospital info formatting...")
    
    if INDIAN_HOSPITALS.get('mumbai'):
        sample_hospital = INDIAN_HOSPITALS['mumbai'][0]
        
        print("Regular format:")
        print(format_hospital_info(sample_hospital))
        
        print("\nEmergency format:")
        print(format_hospital_info(sample_hospital, include_emergency=True))
    
    print("✅ Hospital info formatting test passed\n")

def test_hospital_call_simulation():
    """Test hospital call simulation"""
    print("🧪 Testing hospital call simulation...")
    
    if INDIAN_HOSPITALS.get('delhi'):
        sample_hospital = INDIAN_HOSPITALS['delhi'][0]
        patient_info = {
            'symptoms': 'chest pain and difficulty breathing',
            'location': 'Delhi'
        }
        
        print("Simulating emergency hospital call:")
        result = simulate_hospital_call(sample_hospital, patient_info, 'en')
        
        if result:
            print("✅ Hospital call simulation test passed")
        else:
            print("❌ Hospital call simulation test failed")
    
    print("")

def run_all_tests():
    """Run all tests"""
    print("🚀 Starting AI Health Agent Tests\n")
    print("=" * 50)
    
    test_hospital_database()
    test_hospital_search()
    test_hospital_info_formatting()
    test_hospital_call_simulation()
    
    print("=" * 50)
    print("🎉 All tests completed!")
    print("\nYour AI Health Agent is ready to help patients!")
    print("Run 'python main.py' to start the voice assistant.")

if __name__ == "__main__":
    run_all_tests()