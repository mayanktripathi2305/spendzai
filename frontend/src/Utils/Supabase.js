import { createClient } from '@supabase/supabase-js';

// const supabaseUrl = 'https://qnprzngsulvmqknitdid.supabase.co';
const supabaseUrl = 'https://sdllpzebkalyerqfgxfs.supabase.co';
// const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InFucHJ6bmdzdWx2bXFrbml0ZGlkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAwNjA1OTEsImV4cCI6MjA2NTYzNjU5MX0.4Ma65NsWOg2LwiRtXQpXsJmxiTuAhCIp3mdD26mAkVs'; // Use anon key on frontend only!
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InNkbGxwemVia2FseWVycWZneGZzIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTAzOTg4ODYsImV4cCI6MjA2NTk3NDg4Nn0.4NCM8wcBNGjO9NAu6KvWn76PyDNaXOAwcMYuk2irOAs'; // Use anon key on frontend only!
const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;
