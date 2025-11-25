
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://xngbcrdnorzzgezqdpvm.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhuZ2JjcmRib3J6emdlenFkcHZtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjA2ODM3MDUsImV4cCI6MjA3NjI1OTcwNX0.bfRLUaW5b9AkuhY0uqpXmMwTJ__Nk2Lq_QIiz98DJeE';
const supabase = createClient(supabaseUrl, supabaseKey);

async function fetchData() {
    const { data, error } = await supabase
        .from('prepared_game_rounds')
        .select('*')
        .limit(1);

    if (error) {
        console.error('Error:', error);
    } else {
        console.log('Data Keys:', Object.keys(data[0]));
        console.log('Data:', JSON.stringify(data, null, 2));
    }
}

fetchData();
