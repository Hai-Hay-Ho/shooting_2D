// Cấu hình Supabase của bạn
// Hãy thay thế nội dung dưới bằng thông tin từ Supabase Project Settings của bạn
const SUPABASE_CONFIG = {
    URL: 'https://mmhqwunolgfdfjuxconl.supabase.co',
    ANON_KEY: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1taHF3dW5vbGdmZGZqdXhjb25sIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzA4MDQ3NzYsImV4cCI6MjA4NjM4MDc3Nn0.nA1rgB4CrybOrM8fDSunuO4wAHNtvX0cuggZG6bLJr0'
};

if (typeof module !== 'undefined') {
    module.exports = SUPABASE_CONFIG;
}