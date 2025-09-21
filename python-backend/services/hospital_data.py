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
            "address": "60, Bhulabhai Desai Road, Breach Candy, Mumbai, Maharashtra 400026",
            "phone": "+91-22-23672888",
            "emergency_phone": "+91-22-23672999",
            "specialties": ["General Medicine", "Surgery", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 18.9735,
            "longitude": 72.8042
        }
    ],
    
    # Delhi hospitals
    "delhi": [
        {
            "name": "All India Institute of Medical Sciences (AIIMS)",
            "address": "Ansari Nagar, New Delhi, Delhi 110029",
            "phone": "+91-11-26588500",
            "emergency_phone": "+91-11-26588663",
            "specialties": ["All Medical Specialties", "Emergency Medicine", "Trauma Care"],
            "emergency_services": True,
            "latitude": 28.5672,
            "longitude": 77.2100
        },
        {
            "name": "Fortis Escorts Heart Institute",
            "address": "Okhla Road, New Delhi, Delhi 110025",
            "phone": "+91-11-47135000",
            "emergency_phone": "+91-11-47135911",
            "specialties": ["Cardiology", "Cardiac Surgery", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 28.5355,
            "longitude": 77.2661
        },
        {
            "name": "Apollo Hospital Delhi",
            "address": "Sarita Vihar, New Delhi, Delhi 110076",
            "phone": "+91-11-26925858",
            "emergency_phone": "+91-11-26925911",
            "specialties": ["Cardiology", "Oncology", "Neurology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 28.5355,
            "longitude": 77.2950
        }
    ],
    
    # Bangalore hospitals
    "bangalore": [
        {
            "name": "Manipal Hospital",
            "address": "98, Hal Old Airport Road, Bangalore, Karnataka 560017",
            "phone": "+91-80-25024444",
            "emergency_phone": "+91-80-25024911",
            "specialties": ["Cardiology", "Neurology", "Oncology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 12.9716,
            "longitude": 77.5946
        },
        {
            "name": "Apollo Hospital Bangalore",
            "address": "154/11, Opposite IIM-B, Bannerghatta Road, Bangalore, Karnataka 560076",
            "phone": "+91-80-26304050",
            "emergency_phone": "+91-80-26304911",
            "specialties": ["Cardiology", "Oncology", "Neurology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 12.9352,
            "longitude": 77.6245
        },
        {
            "name": "Fortis Hospital Bangalore",
            "address": "14, Cunningham Road, Bangalore, Karnataka 560052",
            "phone": "+91-80-66214444",
            "emergency_phone": "+91-80-66214911",
            "specialties": ["Cardiology", "Neurology", "Orthopedics", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 12.9716,
            "longitude": 77.5946
        }
    ],
    
    # Chennai hospitals
    "chennai": [
        {
            "name": "Apollo Hospital Chennai",
            "address": "21, Greams Lane, Off Greams Road, Chennai, Tamil Nadu 600006",
            "phone": "+91-44-28293333",
            "emergency_phone": "+91-44-28293911",
            "specialties": ["Cardiology", "Oncology", "Neurology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 13.0827,
            "longitude": 80.2707
        },
        {
            "name": "Fortis Malar Hospital",
            "address": "52, 1st Main Road, Gandhi Nagar, Adyar, Chennai, Tamil Nadu 600020",
            "phone": "+91-44-42289999",
            "emergency_phone": "+91-44-42289911",
            "specialties": ["Cardiology", "Neurology", "Orthopedics", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 13.0067,
            "longitude": 80.2206
        }
    ],
    
    # Hyderabad hospitals
    "hyderabad": [
        {
            "name": "Apollo Hospital Hyderabad",
            "address": "Road No. 72, Opp. Bharatiya Vidya Bhavan, Film Nagar, Hyderabad, Telangana 500033",
            "phone": "+91-40-23607777",
            "emergency_phone": "+91-40-23607911",
            "specialties": ["Cardiology", "Oncology", "Neurology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 17.4065,
            "longitude": 78.4772
        },
        {
            "name": "CARE Hospital Hyderabad",
            "address": "Road No. 1, Banjara Hills, Hyderabad, Telangana 500034",
            "phone": "+91-40-61651000",
            "emergency_phone": "+91-40-61651911",
            "specialties": ["Cardiology", "Neurology", "Oncology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 17.4239,
            "longitude": 78.4738
        }
    ],
    
    # Pune hospitals
    "pune": [
        {
            "name": "Ruby Hall Clinic",
            "address": "40, Sassoon Road, Pune, Maharashtra 411001",
            "phone": "+91-20-26127100",
            "emergency_phone": "+91-20-26127911",
            "specialties": ["Cardiology", "Neurology", "Oncology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 18.5204,
            "longitude": 73.8567
        },
        {
            "name": "Jehangir Hospital",
            "address": "32, Sassoon Road, Pune, Maharashtra 411001",
            "phone": "+91-20-26127000",
            "emergency_phone": "+91-20-26127911",
            "specialties": ["Cardiology", "Orthopedics", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 18.5181,
            "longitude": 73.8578
        }
    ],
    
    # Ahmedabad hospitals
    "ahmedabad": [
        {
            "name": "Apollo Hospital Ahmedabad",
            "address": "Plot No 1A, Bhat GIDC Information Technology Park, Khoraj (Gandhinagar), Gujarat 382610",
            "phone": "+91-79-66708888",
            "emergency_phone": "+91-79-66708911",
            "specialties": ["Cardiology", "Oncology", "Neurology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 23.2599,
            "longitude": 72.6181
        },
        {
            "name": "Sterling Hospital",
            "address": "Near Gurukul, Memnagar, Ahmedabad, Gujarat 380052",
            "phone": "+91-79-66770000",
            "emergency_phone": "+91-79-66770911",
            "specialties": ["Cardiology", "Neurology", "Emergency Medicine"],
            "emergency_services": True,
            "latitude": 23.0585,
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