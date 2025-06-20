const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

// Keyword definitions
const categoryKeywords = {
  Food: ["zomato", "swiggy", "dominos", "pizza", "mcdonald", "kfc", "restaurant", "dineout", "eating", "lunch", "dinner", "breakfast", "eatery", "cafeteria", "cafe", "biryani", "foodpanda", "bbq", "thali", "food", "drinks", "snacks"],
  Transportation: ["uber", "ola", "rapido", "redbus", "irctc", "train", "metro", "bus", "cab", "taxi", "prepaid taxi", "auto", "autorickshaw", "quickride", "shuttl", "goibibo", "makemytrip", "indigo", "airasia", "vistara", "spicejet", "goair", "flight", "air india", "toll", "petrol", "fuel", "Transportation"],
  Entertainment: ["bookmyshow", "pvr", "inox", "cinema", "movies", "netflix", "amazon prime", "hotstar", "disney+", "zee5", "sony liv", "alt balaji", "youtube premium", "spotify", "apple music", "gaming", "theatre", "entertainment", "tickets", "fun city", "arcade"],
  Shopping: ["amazon", "flipkart", "myntra", "ajio", "tatacliq", "meesho", "nykaa", "bigbasket", "grofers", "jiomart", "shopclues", "zivame", "pepperfry", "firstcry", "lenskart", "purplle", "bewakoof", "decathlon", "shopping", "store", "mall", "sale", "purchase", "instamart", "zepto", "blanket", "quickcommerce", "online shopping", "clothes"],
  Utility: ["electricity", "water bill", "bescom", "bmc", "mseb", "bills", "billdesk", "postpaid", "prepaid", "gas", "bharat gas", "indane", "hp gas", "broadband", "internet", "wifi", "airtel", "jio", "vi", "vodafone", "bsnl", "tatasky", "dth", "cable", "mobile recharge", "phonepe recharge", "gpay recharge", "recharge", "Utility"],
  HealthCare: ["pharmacy", "pharmeasy", "1mg", "netmeds", "medlife", "apollo", "health", "clinic", "hospital", "doctor", "medplus", "diagnostics", "pathology", "lab", "consultation", "medicines", "ayurveda", "homeopathy", "medicine", "insurance", "premium", "term insurance", "lab", "diagnosis", "HealthCare"],
  Others: []
};
// Extract last part of narration after '/'
const extractKeyword = (narration = "") => {
  const parts = narration.toLowerCase().split('/');
  return parts[parts.length - 1] || "";
};

export const categorizeTransactionsByMonthObject = (pdfData = []) => {
  const result = {};

  pdfData.forEach((txn) => {
    const dateParts = txn.date?.split("-"); // Format: DD-MM-YYYY
    if (!dateParts || dateParts.length !== 3) return;

    const monthIndex = parseInt(dateParts[1]) - 1;
    const monthName = monthNames[monthIndex];
    const year = parseInt(dateParts[2]);
    const key = `${monthNames[monthIndex]}_${year}`;
    const keyword = extractKeyword(txn.narration)?.toLowerCase() || "";

    // Initialize month object if not present
    if (!result[key]) {
      result[key] = {
        category: Object.keys(categoryKeywords).map(cat => ({
          name: cat,
          totalAmount: 0,
          transactions: []
        }))
      };
    }

    // Find matched category
    let matchedCategory = "Others";
    for (const category in categoryKeywords) {
      if (
        categoryKeywords[category].some(k =>
          keyword.includes(k.toLowerCase())
        )
      ) {
        matchedCategory = category;
        break;
      }
    }

    // Find category object inside this month
    const catObj = result[key].category.find(c => c.name === matchedCategory);
    catObj.transactions.push(txn);
    catObj.totalAmount = parseFloat((catObj.totalAmount + parseFloat(txn.amount || 0)).toFixed(2));

  });

  return result;
};
