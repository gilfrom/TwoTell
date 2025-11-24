import { useState, useEffect } from 'react';
import { supabase } from '../supabase';
import '../App.css'; // Reuse game styles

const ContentManager = ({ onBack }) => {
    const [rounds, setRounds] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [imageQuery, setImageQuery] = useState('');

    useEffect(() => {
        fetchRounds();
    }, []);

    const fetchRounds = async () => {
        setLoading(true);
        const { data, error } = await supabase
            .from('prepared_game_rounds')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) {
            console.error('Error fetching rounds:', error);
            alert('Failed to fetch rounds');
        } else {
            setRounds(data);
            if (data.length > 0) {
                // Set initial query to the true fact text
                setImageQuery(data[0].true_fact);
            }
        }
        setLoading(false);
    };

    const handleNext = () => {
        if (currentIndex < rounds.length - 1) {
            setCurrentIndex(prev => {
                const newIndex = prev + 1;
                setImageQuery(rounds[newIndex].true_fact);
                return newIndex;
            });
        }
    };

    const handlePrev = () => {
        if (currentIndex > 0) {
            setCurrentIndex(prev => {
                const newIndex = prev - 1;
                setImageQuery(rounds[newIndex].true_fact);
                return newIndex;
            });
        }
    };

    const handleDelete = async () => {
        if (!confirm('Are you sure you want to delete this round?')) return;

        const round = rounds[currentIndex];
        const { error } = await supabase
            .from('prepared_game_rounds')
            .delete()
            .eq('id', round.id);

        if (error) {
            alert('Error deleting round: ' + error.message);
        } else {
            // Remove from local state
            const newRounds = rounds.filter(r => r.id !== round.id);
            setRounds(newRounds);
            if (currentIndex >= newRounds.length) {
                setCurrentIndex(Math.max(0, newRounds.length - 1));
            }
        }
    };

    const handleRegenerateImage = async () => {
        const round = rounds[currentIndex];
        if (!round) return;

        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('manage-game-round', {
                body: {
                    action: 'regenerate_image',
                    roundId: round.id,
                    query: imageQuery
                }
            });

            if (error) throw error;

            // Update local state with new image
            const updatedRounds = [...rounds];
            updatedRounds[currentIndex] = { ...round, image_url: data.image_url };
            setRounds(updatedRounds);
            alert('Image updated!');
        } catch (error) {
            console.error('Error updating image:', error);
            alert('Failed to update image: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        // This could be used for manual edits if we add text inputs
        alert('Changes saved locally (image updates are auto-saved).');
    };

    if (loading && rounds.length === 0) return <div className="app-container">Loading...</div>;
    if (rounds.length === 0) return <div className="app-container">No rounds found. <button onClick={onBack}>Back</button></div>;

    const round = rounds[currentIndex];

    return (
        <div className="app-container" style={{ height: 'auto', minHeight: '100vh', justifyContent: 'flex-start' }}>
            <div className="admin-header" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Content Manager ({currentIndex + 1}/{rounds.length})</h2>
                <button onClick={onBack}>Back to Dashboard</button>
            </div>

            <div className="cards-container" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '20px', marginBottom: '20px' }}>
                {/* True Fact Card */}
                <div className="card correct" style={{ cursor: 'default', height: 'auto', minHeight: '400px' }}>
                    <div className="card-image" style={{ height: '200px' }}>
                        {round.true_fact_image_url ? (
                            <img src={round.true_fact_image_url} alt="Fact" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ padding: '20px', color: '#aaa', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333' }}>No Image</div>
                        )}
                    </div>
                    <div className="card-content">
                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px' }}>{round.true_fact}</p>
                        <div className="result-indicator" style={{ fontSize: '0.9rem', padding: '5px 10px', marginTop: 'auto' }}>✅ TRUE</div>
                        <div className="source-date" style={{ marginTop: '5px' }}>{new Date(round.true_fact_posted_date).toLocaleDateString()}</div>
                    </div>
                </div>

                {/* False Claim Card */}
                <div className="card incorrect" style={{ cursor: 'default', height: 'auto', minHeight: '400px' }}>
                    <div className="card-image" style={{ height: '200px' }}>
                        {round.true_fact_image_url ? (
                            <img src={round.true_fact_image_url} alt="Fact" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ padding: '20px', color: '#aaa', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333' }}>No Image</div>
                        )}
                    </div>
                    <div className="card-content">
                        <p style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '10px' }}>{round.false_claim}</p>
                        <div className="result-indicator" style={{ fontSize: '0.9rem', padding: '5px 10px', marginTop: 'auto' }}>❌ {round.textual_rating}</div>
                        <div className="source-date" style={{ marginTop: '5px' }}>{new Date(round.false_claim_posted_date).toLocaleDateString()}</div>
                    </div>
                </div>
            </div>

            <div className="controls" style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '600px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px' }}>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={handlePrev} disabled={currentIndex === 0}>Previous</button>
                    <button onClick={handleNext} disabled={currentIndex === rounds.length - 1}>Next</button>
                </div>

                <div style={{ borderTop: '1px solid #444', margin: '10px 0' }}></div>

                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                    <input
                        type="text"
                        value={imageQuery}
                        onChange={(e) => setImageQuery(e.target.value)}
                        placeholder="Image search query..."
                        style={{ flex: 1, padding: '8px', borderRadius: '4px', border: '1px solid #444', background: '#333', color: 'white' }}
                    />
                    <button onClick={handleRegenerateImage} disabled={loading} style={{ backgroundColor: '#2196f3' }}>
                        {loading ? 'Fetching...' : 'Fetch New Image'}
                    </button>
                </div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                    <button onClick={handleDelete} style={{ backgroundColor: '#f44336' }}>Delete Pair</button>
                    <button onClick={handleSave} style={{ backgroundColor: '#4caf50' }}>Save</button>
                </div>
            </div>
        </div>
    );
};

export default ContentManager;
