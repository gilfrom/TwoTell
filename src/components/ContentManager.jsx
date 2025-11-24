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

    const handleRegenerateImage = async (cardType) => {
        const round = rounds[currentIndex];
        if (!round) return;

        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('manage-game-round', {
                body: {
                    action: 'regenerate_image',
                    roundId: round.id,
                    cardType: cardType, // 'true' or 'false'
                    query: cardType === 'true' ? round.true_fact_headline : round.false_claim_text
                }
            });

            if (error) throw error;

            // Update local state with new image
            const updatedRounds = [...rounds];
            if (cardType === 'true') {
                updatedRounds[currentIndex] = { ...round, true_fact_image_url: data.image_url };
            } else {
                updatedRounds[currentIndex] = { ...round, false_claim_image_url: data.image_url };
            }
            setRounds(updatedRounds);
            alert('Image updated!');
        } catch (error) {
            console.error('Error updating image:', error);
            alert('Failed to update image: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    if (loading && rounds.length === 0) return <div className="app-container">Loading...</div>;
    if (rounds.length === 0) return <div className="app-container">No rounds found. <button onClick={onBack}>Back</button></div>;

    const round = rounds[currentIndex];

    return (
        <div className="app-container" style={{ height: 'auto', minHeight: '100vh', justifyContent: 'flex-start', padding: '20px' }}>
            <div className="admin-header" style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                <h2>Content Manager ({currentIndex + 1}/{rounds.length})</h2>
                <button onClick={onBack}>Back to Dashboard</button>
            </div>

            <div className="cards-container" style={{ flexDirection: 'row', flexWrap: 'wrap', gap: '20px', marginBottom: '20px', alignItems: 'flex-start' }}>
                {/* True Fact Card */}
                <div className="card correct" style={{ cursor: 'default', width: '400px', height: 'auto' }}>
                    <div style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{round.true_fact_headline}</h3>
                    </div>
                    <div className="card-image" style={{ height: '250px', position: 'relative' }}>
                        {round.true_fact_image_url ? (
                            <img src={round.true_fact_image_url} alt="True Fact" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ padding: '20px', color: '#aaa', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333' }}>No Image</div>
                        )}
                        <button
                            onClick={() => handleRegenerateImage('true')}
                            disabled={loading}
                            style={{
                                position: 'absolute',
                                bottom: '10px',
                                right: '10px',
                                padding: '8px 12px',
                                backgroundColor: '#2196f3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            {loading ? '...' : 'Change Image'}
                        </button>
                    </div>
                    <div style={{ padding: '15px' }}>
                        <div className="source-date" style={{ fontSize: '0.9rem', color: '#aaa' }}>
                            {new Date(round.true_fact_posted_date).toLocaleDateString()}
                        </div>
                    </div>
                </div>

                {/* False Claim Card */}
                <div className="card incorrect" style={{ cursor: 'default', width: '400px', height: 'auto' }}>
                    <div style={{ padding: '15px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
                        <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 'bold' }}>{round.false_claim_text}</h3>
                    </div>
                    <div className="card-image" style={{ height: '250px', position: 'relative' }}>
                        {round.false_claim_image_url ? (
                            <img src={round.false_claim_image_url} alt="False Claim" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <div style={{ padding: '20px', color: '#aaa', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#333' }}>No Image</div>
                        )}
                        <button
                            onClick={() => handleRegenerateImage('false')}
                            disabled={loading}
                            style={{
                                position: 'absolute',
                                bottom: '10px',
                                right: '10px',
                                padding: '8px 12px',
                                backgroundColor: '#2196f3',
                                color: 'white',
                                border: 'none',
                                borderRadius: '4px',
                                cursor: 'pointer',
                                fontSize: '0.9rem'
                            }}
                        >
                            {loading ? '...' : 'Change Image'}
                        </button>
                    </div>
                    <div style={{ padding: '15px' }}>
                        <div className="source-date" style={{ fontSize: '0.9rem', color: '#aaa' }}>
                            {new Date(round.false_claim_posted_date).toLocaleDateString()}
                        </div>
                    </div>
                </div>
            </div>

            <div className="controls" style={{ display: 'flex', flexDirection: 'column', gap: '15px', width: '100%', maxWidth: '600px', background: 'rgba(0,0,0,0.2)', padding: '20px', borderRadius: '12px' }}>
                <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
                    <button onClick={handlePrev} disabled={currentIndex === 0}>Previous</button>
                    <button onClick={handleNext} disabled={currentIndex === rounds.length - 1}>Next</button>
                </div>

                <div style={{ borderTop: '1px solid #444', margin: '10px 0' }}></div>

                <div style={{ display: 'flex', gap: '10px', justifyContent: 'space-between' }}>
                    <button onClick={handleDelete} style={{ backgroundColor: '#f44336' }}>Delete Pair</button>
                </div>
            </div>
        </div>
    );
};

export default ContentManager;
