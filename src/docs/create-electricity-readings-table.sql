-- Create electricity_readings table for tracking daily electricity consumption
CREATE TABLE IF NOT EXISTS public.electricity_readings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    reading DECIMAL(10, 2) NOT NULL,
    reading_date DATE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    created_by UUID REFERENCES auth.users(id),
    UNIQUE(reading_date)
);

-- Add comment
COMMENT ON TABLE public.electricity_readings IS 'Daily electricity meter readings in kWh';

-- Create index for faster date queries
CREATE INDEX IF NOT EXISTS idx_electricity_readings_date ON public.electricity_readings(reading_date DESC);

-- Enable RLS
ALTER TABLE public.electricity_readings ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Allow admins to read all electricity readings
CREATE POLICY "Admins can read electricity readings"
    ON public.electricity_readings
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS Policy: Allow admins to insert electricity readings
CREATE POLICY "Admins can insert electricity readings"
    ON public.electricity_readings
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS Policy: Allow admins to update electricity readings
CREATE POLICY "Admins can update electricity readings"
    ON public.electricity_readings
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

-- RLS Policy: Allow admins to delete electricity readings
CREATE POLICY "Admins can delete electricity readings"
    ON public.electricity_readings
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM public.profiles
            WHERE profiles.id = auth.uid()
            AND profiles.role = 'admin'
        )
    );

