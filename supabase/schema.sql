-- ============================================
-- اسکیمای دیتابیس ArchaeoVision Pro
-- طراحی شده توسط تیم بک‌اند و دیتابیس
-- ============================================

-- فعال‌سازی پسوندهای مورد نیاز
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- جدول لایسنس‌ها
-- ============================================
CREATE TABLE licenses (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_id VARCHAR(100) UNIQUE NOT NULL,
  activation_code VARCHAR(10) NOT NULL,
  secure_signature VARCHAR(255) NOT NULL,
  activated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  CONSTRAINT valid_system_id CHECK (system_id ~ '^ME-[0-9]{9}$'),
  CONSTRAINT valid_activation_code CHECK (activation_code ~ '^M[0-9]A[0-9]C[0-9]$')
);

-- ایندکس‌ها
CREATE INDEX idx_licenses_system_id ON licenses(system_id);
CREATE INDEX idx_licenses_expires_at ON licenses(expires_at);
CREATE INDEX idx_licenses_created_at ON licenses(created_at);

-- ============================================
-- جدول آمار مصرف
-- ============================================
CREATE TABLE usage_stats (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_id VARCHAR(100) NOT NULL REFERENCES licenses(system_id) ON DELETE CASCADE,
  analysis_date DATE NOT NULL,
  analysis_count INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(system_id, analysis_date)
);

CREATE INDEX idx_usage_stats_system_id ON usage_stats(system_id);
CREATE INDEX idx_usage_stats_date ON usage_stats(analysis_date);

-- ============================================
-- جدول تاریخچه تحلیل‌ها
-- ============================================
CREATE TABLE analysis_history (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_id VARCHAR(100) NOT NULL REFERENCES licenses(system_id) ON DELETE CASCADE,
  coordinates JSONB NOT NULL,
  result JSONB,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_analysis_history_system_id ON analysis_history(system_id);
CREATE INDEX idx_analysis_history_created_at ON analysis_history(created_at);

-- ============================================
-- جدول لاگ فعال‌سازی
-- ============================================
CREATE TABLE activation_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  system_id VARCHAR(100),
  ip_address INET,
  user_agent TEXT,
  action VARCHAR(50) NOT NULL,
  success BOOLEAN DEFAULT true,
  error_message TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE INDEX idx_activation_logs_system_id ON activation_logs(system_id);
CREATE INDEX idx_activation_logs_created_at ON activation_logs(created_at);
CREATE INDEX idx_activation_logs_action ON activation_logs(action);

-- ============================================
-- توابع و تریگرها
-- ============================================

-- تابع بروزرسانی خودکار updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_licenses_updated_at
  BEFORE UPDATE ON licenses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_usage_stats_updated_at
  BEFORE UPDATE ON usage_stats
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- تابع پاکسازی خودکار لاگ‌های قدیمی (بعد از ۳ ماه)
CREATE OR REPLACE FUNCTION cleanup_old_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM activation_logs WHERE created_at < NOW() - INTERVAL '3 months';
  DELETE FROM analysis_history WHERE created_at < NOW() - INTERVAL '1 month';
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ویوهای تحلیلی
-- ============================================

-- ویو آمار مصرف روزانه
CREATE VIEW daily_usage_stats AS
SELECT 
  DATE(created_at) as day,
  COUNT(DISTINCT system_id) as active_users,
  COUNT(*) as total_analyses,
  AVG(EXTRACT(EPOCH FROM (updated_at - created_at))) as avg_analysis_time
FROM analysis_history
GROUP BY DATE(created_at)
ORDER BY day DESC;

-- ویو لایسنس‌های در حال انقضا
CREATE VIEW expiring_licenses AS
SELECT 
  system_id,
  activated_at,
  expires_at,
  EXTRACT(DAY FROM (expires_at - NOW())) as days_left
FROM licenses
WHERE expires_at > NOW() 
  AND expires_at < NOW() + INTERVAL '30 days'
ORDER BY expires_at;