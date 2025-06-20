// Keyword definitions
const categoryKeywords = {
  Food: ["zomato", "swiggy", "dominos", "pizza", "mcdonald", "kfc", "restaurant", "dineout", "eating", "lunch", "dinner", "breakfast", "eatery", "cafeteria", "cafe", "biryani", "foodpanda", "bbq", "thali", "food", "drinks", "snacks"],

  Transportation: ["uber", "ola", "rapido", "redbus", "irctc", "train", "metro", "bus", "cab", "taxi", "prepaid taxi", "auto", "autorickshaw", "quickride", "shuttl", "goibibo", "makemytrip", "indigo", "airasia", "vistara", "spicejet", "goair", "flight", "air india", "toll", "petrol", "fuel","Transportation"],

  Entertainment: ["bookmyshow", "pvr", "inox", "cinema", "movies", "netflix", "amazon prime", "hotstar", "disney+", "zee5", "sony liv", "alt balaji", "youtube premium", "spotify", "apple music", "gaming", "theatre", "entertainment", "tickets", "fun city", "arcade"],

  Shopping: ["amazon", "flipkart", "myntra", "ajio", "tatacliq", "meesho", "nykaa", "bigbasket", "grofers", "jiomart", "shopclues", "zivame", "pepperfry", "firstcry", "lenskart", "purplle", "bewakoof", "decathlon", "shopping", "store", "mall", "sale", "purchase", "instamart", "zepto", "blanket", "quickcommerce", "online shopping", "clothes"],

  Utility: ["electricity", "water bill", "bescom", "bmc", "mseb", "bills", "billdesk", "postpaid", "prepaid", "gas", "bharat gas", "indane", "hp gas", "broadband", "internet", "wifi", "airtel", "jio", "vi", "vodafone", "bsnl", "tatasky", "dth", "cable", "mobile recharge", "phonepe recharge", "gpay recharge", "recharge","Utility"],

  HealthCare: ["pharmacy", "pharmeasy", "1mg", "netmeds", "medlife", "apollo", "health", "clinic", "hospital", "doctor", "medplus", "diagnostics", "pathology", "lab", "consultation", "medicines", "ayurveda", "homeopathy", "medicine", "insurance", "premium", "term insurance", "lab", "diagnosis","HealthCare"],
  
  Others:[]
};
// Utility function
export const categorizeTransactions = (pdfData = []) => {
  const result = {};

  // Initialize result object with categories
  for (const category in categoryKeywords) {
    result[category] = {
      transactions: [],
      totalAmount: 0
    };
    
  }
  result["Others"] = {
      transactions: [],
      totalAmount: 0
    };

  // Helper: extract keyword from narration
  const extractKeyword = (narration = "") => {
    const parts = narration.toLowerCase().split('/');
    return parts[parts.length - 1] || "";
  };

  // Process each transaction
pdfData.forEach((txn) => {
  const keyword = extractKeyword(txn.narration)?.toLowerCase() || "";
  let matched = false;

  for (const category in categoryKeywords) {
    const match = categoryKeywords[category].some(k => keyword.includes(k.toLowerCase()));
    if (match) {
      result[category].transactions.push(txn);
      result[category].totalAmount += parseFloat(txn?.amount || 0);
      matched = true;
      break;
    }
  }

  if (!matched) {
    result["Others"].transactions.push(txn);
    result["Others"].totalAmount += parseFloat(txn.amount || 0);
  }
});


  return result;
};
