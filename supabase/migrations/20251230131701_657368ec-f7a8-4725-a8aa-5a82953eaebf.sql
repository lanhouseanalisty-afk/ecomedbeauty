-- Enable realtime for orders table (for admin notifications)
ALTER PUBLICATION supabase_realtime ADD TABLE public.orders;