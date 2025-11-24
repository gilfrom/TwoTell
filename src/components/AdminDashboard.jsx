import { useState, useEffect } from 'react';
import { db } from '../firebase';
import { supabase } from '../supabase';
import { collection, addDoc, getDocs, query, where, updateDoc, doc, deleteDoc } from 'firebase/firestore';
import './AdminDashboard.css';

import ContentManager from './ContentManager';

const AdminDashboard = ({ onBack }) => {
    const [drafts, setDrafts] = useState([]);
    const [loading, setLoading] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [editForm, setEditForm] = useState({ text: '', url: '', source: '', falseClaim: '' });
    const [repairDaysBack, setRepairDaysBack] = useState(7);
    const [repairForceRefresh, setRepairForceRefresh] = useState(false);
    const [repairMode, setRepairMode] = useState('repair');
    const [currentView, setCurrentView] = useState('dashboard'); // 'dashboard' or 'content-manager'

    useEffect(() => {
        fetchDrafts();
    }, []);

    const fetchDrafts = async () => {
        const q = query(collection(db, "questions"), where("status", "==", "draft"));
        const querySnapshot = await getDocs(q);
        const draftsData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setDrafts(draftsData);
    };

    // ... (keep existing scan functions: scanReddit, handleScanFakeClaims, handleScanTrueFacts, handlePrepareGameRound, handleRepairGameRounds) ...
    const scanReddit = async () => {
        setLoading(true);
        try {
            const response = await fetch('https://www.reddit.com/r/todayilearned/top.json?limit=10');
            const data = await response.json();
            const posts = data.data.children;

            for (const post of posts) {
                const { title, url, id } = post.data;
                // Simple check to avoid duplicates (not perfect)
                const q = query(collection(db, "questions"), where("text", "==", title));
                const querySnapshot = await getDocs(q);

                if (querySnapshot.empty) {
                    await addDoc(collection(db, "questions"), {
                        text: title,
                        url: url,
                        source: "Reddit r/todayilearned",
                        date: new Date().toLocaleDateString(),
                        status: 'draft',
                        originalId: id
                    });
                }
            }
            fetchDrafts();
        } catch (error) {
            console.error("Error scanning Reddit:", error);
            alert("Failed to scan Reddit.");
        }
        setLoading(false);
    };

    const handleScanFakeClaims = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('scan-bulk-fact-checks');
            if (error) throw error;
            alert('Scan initiated successfully! Check console for details.');
            console.log('Scan result:', data);
        } catch (error) {
            console.error('Error scanning fake claims:', error);
            alert('Failed to initiate scan: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleScanTrueFacts = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('find-true-facts-with-perplexity');
            if (error) throw error;
            alert('True Fact Scan initiated! Check console.');
            console.log('Perplexity Scan result:', data);
        } catch (error) {
            console.error('Error scanning true facts:', error);
            alert('Failed to scan true facts: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handlePrepareGameRound = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('prepare-game-rounds', {
                body: {
                    mode: 'full',
                    daysBack: 1,
                    forceImageRefresh: false
                }
            });
            if (error) throw error;
            alert('Game Round Preparation initiated! Check console.');
            console.log('Prepare Game Round result:', data);
        } catch (error) {
            console.error('Error preparing game round:', error);
            alert('Failed to prepare game round: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const handleRepairGameRounds = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('prepare-game-rounds', {
                body: {
                    mode: repairMode,
                    daysBack: parseInt(repairDaysBack),
                    forceImageRefresh: repairForceRefresh
                }
            });
            if (error) throw error;
            alert('Game Round Repair initiated! Check console.');
            console.log('Repair Game Round result:', data);
        } catch (error) {
            console.error('Error repairing game round:', error);
            alert('Failed to repair game round: ' + error.message);
        } finally {
            setLoading(false);
        }
    };

    const searchFakeNews = () => {
        const sites = [
            'snopes.com', 'politifact.com', 'reuters.com', 'factcheck.org',
            'factcheck.afp.com', 'fullfact.org', 'apnews.com'
        ];
        const query = `site:${sites.join(' OR site:')} "false"`;
        window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
    };

    const startCreating = () => {
        setEditingId('new');
        setEditForm({ text: '', url: '', source: '', falseClaim: '' });
    };

    const startEditing = (draft) => {
        setEditingId(draft.id);
        setEditForm({
            text: draft.text,
            url: draft.url,
            source: draft.source,
            falseClaim: ''
        });
    };

    const handlePublish = async (draftId) => {
        if (!editForm.falseClaim.trim() || !editForm.text.trim()) {
            alert("Please fill in both claims.");
            return;
        }

        try {
            const trueOption = {
                id: "a",
                text: editForm.text,
                isTrue: true,
                source: editForm.source || "Verified Source",
                date: new Date().toLocaleDateString(),
                url: editForm.url,
                image: null
            };

            const falseOption = {
                id: "b",
                text: editForm.falseClaim,
                isTrue: false,
                source: "Fabricated",
                date: new Date().toLocaleDateString(),
                image: null
            };

            if (draftId === 'new') {
                await addDoc(collection(db, "questions"), {
                    text: editForm.text,
                    url: editForm.url,
                    source: editForm.source,
                    date: new Date().toLocaleDateString(),
                    status: 'published',
                    options: [trueOption, falseOption],
                    topic: 'General Knowledge'
                });
            } else {
                await updateDoc(doc(db, "questions", draftId), {
                    text: editForm.text, // Allow updating true text too
                    url: editForm.url,
                    source: editForm.source,
                    status: 'published',
                    options: [trueOption, falseOption]
                });
            }

            setEditingId(null);
            setEditForm({ text: '', url: '', source: '', falseClaim: '' });
            fetchDrafts();
            alert("Published!");
        } catch (error) {
            console.error("Error publishing:", error);
            alert("Failed to publish.");
        }
    };

    const handleDelete = async (id) => {
        if (confirm("Delete this draft?")) {
            await deleteDoc(doc(db, "questions", id));
            fetchDrafts();
        }
    }

    if (currentView === 'content-manager') {
        return <ContentManager onBack={() => setCurrentView('dashboard')} />;
    }

    return (
        <div className="admin-dashboard">
            <div className="admin-header">
                <h2>Admin Dashboard</h2>
                <button onClick={onBack}>Back to Game</button>
            </div>

            <div className="admin-actions">
                <button className="scan-button" onClick={() => setCurrentView('content-manager')} style={{ backgroundColor: '#9c27b0', width: '100%', marginBottom: '15px', padding: '15px', fontSize: '1.1em' }}>
                    Manage Content (Review & Edit)
                </button>

                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', marginBottom: '20px' }}>
                    <button className="scan-button" onClick={handleScanFakeClaims} disabled={loading} style={{ backgroundColor: '#e91e63' }}>
                        {loading ? 'Scanning...' : 'Scan for Fake Claims'}
                    </button>
                    <button className="scan-button" onClick={handleScanTrueFacts} disabled={loading} style={{ backgroundColor: '#2196f3' }}>
                        {loading ? 'Scanning...' : 'Scan True Facts (Perplexity)'}
                    </button>
                    <button className="scan-button" onClick={handlePrepareGameRound} disabled={loading} style={{ backgroundColor: '#4caf50' }}>
                        {loading ? 'Scanning...' : 'Prepare Game Round'}
                    </button>
                </div>

                <div style={{ display: 'inline-flex', alignItems: 'center', border: '1px solid #ccc', padding: '10px', borderRadius: '5px', flexWrap: 'wrap', gap: '10px' }}>
                    <label style={{ fontSize: '12px' }}>Mode:</label>
                    <select
                        value={repairMode}
                        onChange={(e) => setRepairMode(e.target.value)}
                        style={{ fontSize: '12px' }}
                    >
                        <option value="incremental">Incremental</option>
                        <option value="full">Full</option>
                        <option value="repair">Repair</option>
                    </select>
                    <label style={{ fontSize: '12px' }}>Days Back:</label>
                    <input
                        type="number"
                        value={repairDaysBack}
                        onChange={(e) => setRepairDaysBack(e.target.value)}
                        style={{ width: '50px' }}
                    />
                    <label style={{ fontSize: '12px' }}>Force Refresh:</label>
                    <input
                        type="checkbox"
                        checked={repairForceRefresh}
                        onChange={(e) => setRepairForceRefresh(e.target.checked)}
                    />
                    <button className="scan-button" onClick={handleRepairGameRounds} disabled={loading} style={{ backgroundColor: '#ff9800', fontSize: '12px', padding: '5px 10px' }}>
                        {loading ? 'Scanning...' : 'Repair Game Rounds'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminDashboard;
