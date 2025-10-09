export interface Station {
  code: string;
  name: string;
  city: string;
  state: string;
}

export const INDIAN_RAILWAY_STATIONS: Station[] = [
  // Major Metro Cities
  { code: "NDLS", name: "New Delhi", city: "Delhi", state: "Delhi" },
  { code: "CST", name: "Chhatrapati Shivaji Terminus", city: "Mumbai", state: "Maharashtra" },
  { code: "CSTM", name: "Mumbai CST", city: "Mumbai", state: "Maharashtra" },
  { code: "BCT", name: "Mumbai Central", city: "Mumbai", state: "Maharashtra" },
  { code: "LTT", name: "Lokmanya Tilak Terminus", city: "Mumbai", state: "Maharashtra" },
  { code: "BYC", name: "Bellary Junction", city: "Bellary", state: "Karnataka" },
  { code: "MAS", name: "Chennai Central", city: "Chennai", state: "Tamil Nadu" },
  { code: "SBC", name: "KSR Bengaluru", city: "Bengaluru", state: "Karnataka" },
  { code: "HWH", name: "Howrah Junction", city: "Kolkata", state: "West Bengal" },
  { code: "KOAA", name: "Kolkata", city: "Kolkata", state: "West Bengal" },
  { code: "SC", name: "Secunderabad Junction", city: "Hyderabad", state: "Telangana" },
  { code: "HYB", name: "Hyderabad Deccan", city: "Hyderabad", state: "Telangana" },
  
  // North India
  { code: "AGC", name: "Agra Cantt", city: "Agra", state: "Uttar Pradesh" },
  { code: "LKO", name: "Lucknow", city: "Lucknow", state: "Uttar Pradesh" },
  { code: "CNB", name: "Kanpur Central", city: "Kanpur", state: "Uttar Pradesh" },
  { code: "PNBE", name: "Patna Junction", city: "Patna", state: "Bihar" },
  { code: "ASR", name: "Amritsar Junction", city: "Amritsar", state: "Punjab" },
  { code: "JAT", name: "Jammu Tawi", city: "Jammu", state: "Jammu and Kashmir" },
  { code: "CDG", name: "Chandigarh", city: "Chandigarh", state: "Chandigarh" },
  { code: "DLI", name: "Old Delhi Junction", city: "Delhi", state: "Delhi" },
  { code: "NZM", name: "Hazrat Nizamuddin", city: "Delhi", state: "Delhi" },
  { code: "ANVT", name: "Anand Vihar Terminal", city: "Delhi", state: "Delhi" },
  
  // West India
  { code: "ADI", name: "Ahmedabad Junction", city: "Ahmedabad", state: "Gujarat" },
  { code: "SURAT", name: "Surat", city: "Surat", state: "Gujarat" },
  { code: "BRC", name: "Vadodara Junction", city: "Vadodara", state: "Gujarat" },
  { code: "JP", name: "Jaipur Junction", city: "Jaipur", state: "Rajasthan" },
  { code: "JU", name: "Jodhpur Junction", city: "Jodhpur", state: "Rajasthan" },
  { code: "UDZ", name: "Udaipur City", city: "Udaipur", state: "Rajasthan" },
  { code: "PUNE", name: "Pune Junction", city: "Pune", state: "Maharashtra" },
  { code: "NGP", name: "Nagpur", city: "Nagpur", state: "Maharashtra" },
  
  // South India
  { code: "CBE", name: "Coimbatore Junction", city: "Coimbatore", state: "Tamil Nadu" },
  { code: "MDU", name: "Madurai Junction", city: "Madurai", state: "Tamil Nadu" },
  { code: "TVC", name: "Trivandrum Central", city: "Thiruvananthapuram", state: "Kerala" },
  { code: "ERS", name: "Ernakulam Junction", city: "Kochi", state: "Kerala" },
  { code: "CLT", name: "Kozhikode", city: "Kozhikode", state: "Kerala" },
  { code: "MYS", name: "Mysore Junction", city: "Mysore", state: "Karnataka" },
  { code: "YPR", name: "Yesvantpur Junction", city: "Bengaluru", state: "Karnataka" },
  { code: "VSKP", name: "Visakhapatnam", city: "Visakhapatnam", state: "Andhra Pradesh" },
  { code: "BZA", name: "Vijayawada Junction", city: "Vijayawada", state: "Andhra Pradesh" },
  
  // East India
  { code: "SDAH", name: "Sealdah", city: "Kolkata", state: "West Bengal" },
  { code: "BBS", name: "Bhubaneswar", city: "Bhubaneswar", state: "Odisha" },
  { code: "PURI", name: "Puri", city: "Puri", state: "Odisha" },
  { code: "GHY", name: "Guwahati", city: "Guwahati", state: "Assam" },
  { code: "RNC", name: "Ranchi Junction", city: "Ranchi", state: "Jharkhand" },
  
  // Additional Important Stations
  { code: "BPL", name: "Bhopal Junction", city: "Bhopal", state: "Madhya Pradesh" },
  { code: "INDB", name: "Indore Junction", city: "Indore", state: "Madhya Pradesh" },
  { code: "DBRG", name: "Dibrugarh", city: "Dibrugarh", state: "Assam" },
  { code: "GKP", name: "Gorakhpur Junction", city: "Gorakhpur", state: "Uttar Pradesh" },
  { code: "ALD", name: "Allahabad Junction", city: "Prayagraj", state: "Uttar Pradesh" },
  { code: "DDN", name: "Dehradun", city: "Dehradun", state: "Uttarakhand" },
  { code: "HW", name: "Haridwar Junction", city: "Haridwar", state: "Uttarakhand" },
  { code: "SVDK", name: "Shri Mata Vaishno Devi Katra", city: "Katra", state: "Jammu and Kashmir" },
  { code: "UHL", name: "Una Himachal", city: "Una", state: "Himachal Pradesh" },
  { code: "MMCT", name: "Mumbai Central", city: "Mumbai", state: "Maharashtra" },
  { code: "ST", name: "Surat", city: "Surat", state: "Gujarat" },
  { code: "RTM", name: "Ratlam Junction", city: "Ratlam", state: "Madhya Pradesh" },
];

export const searchStations = (query: string): Station[] => {
  if (!query || query.length < 2) return [];
  
  const searchTerm = query.toLowerCase();
  return INDIAN_RAILWAY_STATIONS.filter(
    station =>
      station.name.toLowerCase().includes(searchTerm) ||
      station.city.toLowerCase().includes(searchTerm) ||
      station.code.toLowerCase().includes(searchTerm)
  ).slice(0, 8); // Limit to 8 results
};
