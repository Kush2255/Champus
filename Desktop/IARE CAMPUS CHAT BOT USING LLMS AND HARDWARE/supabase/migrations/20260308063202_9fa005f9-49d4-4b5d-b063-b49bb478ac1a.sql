
-- Shared chat sessions table
CREATE TABLE public.shared_sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL DEFAULT 'Untitled Session',
  owner_id uuid NOT NULL,
  invite_code text NOT NULL DEFAULT substr(md5(random()::text), 1, 8),
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(invite_code)
);

-- Session participants
CREATE TABLE public.session_participants (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.shared_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  joined_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(session_id, user_id)
);

-- Shared messages within sessions
CREATE TABLE public.shared_messages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id uuid REFERENCES public.shared_sessions(id) ON DELETE CASCADE NOT NULL,
  user_id uuid NOT NULL,
  role text NOT NULL DEFAULT 'user',
  content text NOT NULL,
  user_name text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.shared_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.session_participants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shared_messages ENABLE ROW LEVEL SECURITY;

-- Shared sessions policies: participants can view
CREATE POLICY "Participants can view sessions" ON public.shared_sessions
  FOR SELECT TO authenticated
  USING (
    owner_id = auth.uid() OR
    EXISTS (SELECT 1 FROM public.session_participants WHERE session_id = id AND user_id = auth.uid())
  );

CREATE POLICY "Users can create sessions" ON public.shared_sessions
  FOR INSERT TO authenticated
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Owners can update sessions" ON public.shared_sessions
  FOR UPDATE TO authenticated
  USING (owner_id = auth.uid());

CREATE POLICY "Owners can delete sessions" ON public.shared_sessions
  FOR DELETE TO authenticated
  USING (owner_id = auth.uid());

-- Anyone can view session by invite code for joining
CREATE POLICY "Anyone can view by invite code" ON public.shared_sessions
  FOR SELECT TO authenticated
  USING (true);

-- Session participants policies
CREATE POLICY "Participants can view participants" ON public.session_participants
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.session_participants sp WHERE sp.session_id = session_id AND sp.user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.shared_sessions ss WHERE ss.id = session_id AND ss.owner_id = auth.uid())
  );

CREATE POLICY "Users can join sessions" ON public.session_participants
  FOR INSERT TO authenticated
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can leave sessions" ON public.session_participants
  FOR DELETE TO authenticated
  USING (user_id = auth.uid());

-- Shared messages policies
CREATE POLICY "Participants can view messages" ON public.shared_messages
  FOR SELECT TO authenticated
  USING (
    EXISTS (SELECT 1 FROM public.session_participants WHERE session_id = shared_messages.session_id AND user_id = auth.uid())
    OR EXISTS (SELECT 1 FROM public.shared_sessions WHERE id = shared_messages.session_id AND owner_id = auth.uid())
  );

CREATE POLICY "Participants can send messages" ON public.shared_messages
  FOR INSERT TO authenticated
  WITH CHECK (
    user_id = auth.uid() AND (
      EXISTS (SELECT 1 FROM public.session_participants WHERE session_id = shared_messages.session_id AND user_id = auth.uid())
      OR EXISTS (SELECT 1 FROM public.shared_sessions WHERE id = shared_messages.session_id AND owner_id = auth.uid())
    )
  );

-- Enable realtime for shared messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.shared_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.session_participants;
