import supabase from '../supabase/client';

const getSession = async () => {
  const { data, error } = await supabase.auth.getSession();
  if (error) {
    console.error(error);
  } else {
    return data.session;
  }
};

export { getSession };