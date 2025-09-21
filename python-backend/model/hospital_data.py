"""
Indian Hospital Database
Contains information about hospitals across major Indian cities
"""

INDIAN_HOSPITALS = {
    # Mumbai hospitals
    "mumbai": [
        {
            "name": "Lilavati Hospital and Research Centre",
            "address": "A-791, Bandra Reclamation, Bandra West, Mumbai, Maharashtra 400050",
            "phone": "+91-22-26567777",
            "emergency_phone": "+91-22-26567890",
            "specialties": ["Cardiology", "Orthopedics", "Gastroenterology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 19.0544,
            "longitude": 72.8181
        },
        {
            "name": "Holy Family Hospital",
            "address": "St Andrew Road, Bandra West, Mumbai, Maharashtra 400050",
            "phone": "+91-22-26420800",
            "emergency_phone": "+91-22-26420900",
            "specialties": ["General Medicine", "Surgery", "Emergency Medicine", "Pediatrics"],
            "emergency_services": True,
            "latitude": 19.0544,
            "longitude": 72.8181
        },
        {
            "name": "Kokilaben Dhirubhai Ambani Hospital",
            "address": "Rao Saheb, Achutrao Patwardhan Marg, Four Bungalows, Andheri West, Mumbai, Maharashtra 400053",
            "phone": "+91-22-42696969",
            "emergency_phone": "+91-22-42696100",
            "specialties": ["Cardiology", "Oncology", "Neurology", "Emergency Medicine", "Pediatrics"],
            "emergency_services": True,
            "latitude": 19.1176,
            "longitude": 72.8286
        },
        {
            "name": "Hinduja Hospital",
            "address": "Veer Savarkar Marg, Mahim West, Mumbai, Maharashtra 400016",
            "phone": "+91-22-24447777",
            "emergency_phone": "+91-22-24447890",
            "specialties": ["Neurosurgery", "Cardiology", "Oncology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 19.0330,
            "longitude": 72.8397
        },
        {
            "name": "Breach Candy Hospital",
            "address": "60A, Bhulabhai Desai Rd, Breach Candy, Cumballa Hill, Mumbai, Maharashtra 400026",
            "phone": "+91-22-23667888",
            "emergency_phone": "+91-22-23667999",
            "specialties": ["General Medicine", "Surgery", "Pediatrics", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 18.9735,
            "longitude": 72.8062
        }
    ],
    
    # Delhi hospitals
    "delhi": [
        {
            "name": "All India Institute of Medical Sciences (AIIMS)",
            "address": "Sri Aurobindo Marg, Ansari Nagar, New Delhi, Delhi 110029",
            "phone": "+91-11-26588500",
            "emergency_phone": "+91-11-26588663",
            "specialties": ["All Specialties", "Emergency Medicine", "Trauma Care"],
            "emergency_services": True,
            "latitude": 28.5672,
            "longitude": 77.2100
        },
        {
            "name": "Fortis Escorts Heart Institute",
            "address": "Okhla Road, New Delhi, Delhi 110025",
            "phone": "+91-11-47135000",
            "emergency_phone": "+91-11-47135001",
            "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 28.5355,
            "longitude": 77.2731
        },
        {
            "name": "Max Super Speciality Hospital Saket",
            "address": "1, 2, Press Enclave Road, Saket, New Delhi, Delhi 110017",
            "phone": "+91-11-26515050",
            "emergency_phone": "+91-11-26515051",
            "specialties": ["Oncology", "Neurology", "Orthopedics", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 28.5245,
            "longitude": 77.2066
        },
        {
            "name": "Apollo Hospital Delhi",
            "address": "Mathura Road, Sarita Vihar, New Delhi, Delhi 110076",
            "phone": "+91-11-26925858",
            "emergency_phone": "+91-11-26925801",
            "specialties": ["Cardiology", "Neurology", "Oncology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 28.5355,
            "longitude": 77.2731
        }
    ],
    
    # Bangalore hospitals
    "bangalore": [
        {
            "name": "Manipal Hospital Old Airport Road",
            "address": "98, Rustum Bagh, Airport Road, Bangalore, Karnataka 560017",
            "phone": "+91-80-25023344",
            "emergency_phone": "+91-80-25023355",
            "specialties": ["Cardiology", "Neurology", "Oncology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 12.9716,
            "longitude": 77.5946
        },
        {
            "name": "Apollo Hospital Bannerghatta Road",
            "address": "154/11, Bannerghatta Road, Opposite IIM-B, Bangalore, Karnataka 560076",
            "phone": "+91-80-26304050",
            "emergency_phone": "+91-80-26304051",
            "specialties": ["Cardiology", "Orthopedics", "Neurosurgery", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 12.9010,
            "longitude": 77.5934
        },
        {
            "name": "Fortis Hospital Bannerghatta Road",
            "address": "154/9, Bannerghatta Road, Opposite IIM-B, Bangalore, Karnataka 560076",
            "phone": "+91-80-66214444",
            "emergency_phone": "+91-80-66214000",
            "specialties": ["Cardiology", "Neurology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 12.9016,
            "longitude": 77.5940
        },
        {
            "name": "Narayana Health City",
            "address": "258/A, Bommasandra Industrial Area, Anekal Taluk, Bangalore, Karnataka 560099",
            "phone": "+91-80-71222222",
            "emergency_phone": "+91-80-71222200",
            "specialties": ["Cardiac Surgery", "Neurosurgery", "Oncology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 12.7987,
            "longitude": 77.7066
        }
    ],
    
    # Chennai hospitals  
    "chennai": [
        {
            "name": "Apollo Hospital Greams Road",
            "address": "21, Greams Lane, Off Greams Road, Chennai, Tamil Nadu 600006",
            "phone": "+91-44-28290200",
            "emergency_phone": "+91-44-28290444",
            "specialties": ["Cardiology", "Oncology", "Neurology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 13.0594,
            "longitude": 80.2584
        },
        {
            "name": "Fortis Malar Hospital",
            "address": "52, 1st Main Road, Gandhi Nagar, Adyar, Chennai, Tamil Nadu 600020",
            "phone": "+91-44-42894289",
            "emergency_phone": "+91-44-42894200",
            "specialties": ["Cardiology", "Neurology", "Orthopedics", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 13.0067,
            "longitude": 80.2206
        },
        {
            "name": "MIOT International",
            "address": "4/112, Mount Poonamallee Road, Manapakkam, Chennai, Tamil Nadu 600089",
            "phone": "+91-44-22496500",
            "emergency_phone": "+91-44-22496911",
            "specialties": ["Orthopedics", "Cardiology", "Neurosurgery", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 13.0389,
            "longitude": 80.1582
        }
    ],
    
    # Hyderabad hospitals
    "hyderabad": [
        {
            "name": "Apollo Health City",
            "address": "Film Nagar, Jubilee Hills, Hyderabad, Telangana 500033",
            "phone": "+91-40-23607777",
            "emergency_phone": "+91-40-23607890",
            "specialties": ["Cardiology", "Oncology", "Neurology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 17.4239,
            "longitude": 78.4738
        },
        {
            "name": "Care Hospital Banjara Hills",
            "address": "Road No. 1, Banjara Hills, Hyderabad, Telangana 500034",
            "phone": "+91-40-61651000",
            "emergency_phone": "+91-40-61651911",
            "specialties": ["Cardiology", "Neurology", "Orthopedics", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 17.4126,
            "longitude": 78.4071
        }
    ],
    
    # Pune hospitals
    "pune": [
        {
            "name": "Ruby Hall Clinic",
            "address": "40, Sassoon Road, Pune, Maharashtra 411001",
            "phone": "+91-20-26122171",
            "emergency_phone": "+91-20-26122911",
            "specialties": ["General Medicine", "Surgery", "Cardiology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 18.5292,
            "longitude": 73.8570
        },
        {
            "name": "Jehangir Hospital",
            "address": "32, Sassoon Road, Pune, Maharashtra 411001",
            "phone": "+91-20-26127100",
            "emergency_phone": "+91-20-26127911",
            "specialties": ["Cardiology", "Neurology", "Oncology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 18.5314,
            "longitude": 73.8567
        }
    ],
    
    # Ahmedabad hospitals
    "ahmedabad": [
        {
            "name": "Apollo Hospital Ahmedabad",
            "address": "Plot No 1A, GIDC Estate, Bhat, Gandhinagar, Gujarat 382428",
            "phone": "+91-79-66700800",
            "emergency_phone": "+91-79-66700911",
            "specialties": ["Cardiology", "Neurology", "Oncology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 23.1793,
            "longitude": 72.6397
        },
        {
            "name": "Zydus Hospital",
            "address": "Zydus Hospital Road, Nr. Sola Bridge, SG Highway, Ahmedabad, Gujarat 380054",
            "phone": "+91-79-66512222",
            "emergency_phone": "+91-79-66512911",
            "specialties": ["Cardiology", "Neurosurgery", "Orthopedics", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 23.0644,
            "longitude": 72.5181
        }
    ],
    
    # Kolkata hospitals
    "kolkata": [
        {
            "name": "Apollo Gleneagles Hospital",
            "address": "58, Canal Circular Road, Kadapara, Phool Bagan, Kolkata, West Bengal 700054",
            "phone": "+91-33-23203040",
            "emergency_phone": "+91-33-23203911",
            "specialties": ["Cardiology", "Neurology", "Oncology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 22.5726,
            "longitude": 88.3639
        },
        {
            "name": "Fortis Hospital Anandapur",
            "address": "730, Eastern Metropolitan Bypass, Anandapur, Kolkata, West Bengal 700107",
            "phone": "+91-33-66289999",
            "emergency_phone": "+91-33-66289911",
            "specialties": ["Cardiology", "Neurology", "Orthopedics", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 22.5107,
            "longitude": 88.3851
        }
    ]
}

# Common emergency conditions that require immediate hospital attention
EMERGENCY_CONDITIONS = [
    "chest pain", "difficulty breathing", "severe bleeding", "unconsciousness", 
    "severe burns", "stroke symptoms", "heart attack", "severe allergic reaction",
    "broken bones", "head injury", "poisoning", "severe abdominal pain",
    "high fever above 103", "seizures", "severe vomiting", "severe diarrhea"
]