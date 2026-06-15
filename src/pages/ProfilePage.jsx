import { useState, useEffect } from 'react';
import api from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const inputStyle = {
  width: '100%', padding: '10px 12px',
  background: '#1a1a22', border: '1px solid rgba(255,255,255,0.1)',
  borderRadius: 8, color: 'white', fontSize: 13, outline: 'none',
  boxSizing: 'border-box',
};

const labelStyle = { display: 'block', marginBottom: 6, fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600 };

export default function ProfilePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [formData, setFormData] = useState({
    name: '', bio: '', niche: '', platform: '', platformProfileUrl: '',
    followers: '', following: '', posts: '', totalLikes: '', totalViews: '', avgEngagement: '', profilePicture: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        const res = await api.get('/auth/profile');
        const u = res.data;
        setFormData({
          name: u.name || '',
          bio: u.bio || '',
          niche: u.niche || '',
          platform: u.platform || '',
          platformProfileUrl: u.platformProfileUrl || '',
          followers: u.followers || '',
          following: u.following || '',
          posts: u.posts || '',
          totalLikes: u.totalLikes || '',
          totalViews: u.totalViews || '',
          avgEngagement: u.avgEngagement || '',
          profilePicture: u.profilePicture || '',
        });
      } catch (err) {
        console.error('Failed to load profile', err);
        // Fallback to auth context user
        if (user) {
          setFormData(prev => ({
            ...prev,
            name: user.name || '',
            niche: user.niche || '',
            platform: user.platform || '',
          }));
        }
      }
    };
    loadProfile();
  }, []);

  const handleSave = async () => {
    try {
      setSaving(true);
      await api.put('/auth/profile/update', formData);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err) {
      console.error('Failed to save profile', err);
    } finally {
      setSaving(false);
    }
  };

  const set = (field) => (e) => setFormData(prev => ({ ...prev, [field]: e.target.value }));

  const tabs = ['profile', 'creator stats', 'security'];

  return (
    <div style={{ minHeight: '100vh', background: '#060608', color: '#ffffff', padding: '40px', fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        .profile-tab-btn { transition: all 0.18s ease; }
        .profile-tab-btn:hover { background: rgba(255,255,255,0.06) !important; }
        .save-btn:hover { filter: brightness(1.1); transform: translateY(-1px); }
        input:focus, textarea:focus, select:focus { border-color: rgba(139,92,246,0.5) !important; }
      `}</style>

      <div style={{ maxWidth: 720, margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: 24, fontWeight: 800, margin: 0, letterSpacing: '-0.5px' }}>Profile Settings</h1>
          <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: 13, margin: '6px 0 0' }}>Manage your creator profile and social stats</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 8, marginBottom: 28, borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 16 }}>
          {tabs.map(tab => (
            <button key={tab} className="profile-tab-btn" onClick={() => setActiveTab(tab)} style={{
              background: activeTab === tab ? 'rgba(139,92,246,0.15)' : 'transparent',
              color: activeTab === tab ? '#a78bfa' : 'rgba(255,255,255,0.45)',
              border: activeTab === tab ? '1px solid rgba(139,92,246,0.3)' : '1px solid transparent',
              padding: '8px 18px', borderRadius: 8, cursor: 'pointer', fontSize: 13,
              fontWeight: activeTab === tab ? 700 : 500, textTransform: 'capitalize',
            }}>
              {tab === 'creator stats' ? '📊 Creator Stats' : tab === 'profile' ? '👤 Profile' : '🔒 Security'}
            </button>
          ))}
        </div>

        {/* Profile Tab */}
        {activeTab === 'profile' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div style={{ background: '#0c0c10', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, marginBottom: 20, margin: '0 0 20px' }}>Basic Information</h2>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>Display Name</label>
                  <input style={inputStyle} value={formData.name} onChange={set('name')} placeholder="Your name" />
                </div>
                <div>
                  <label style={labelStyle}>Niche / Category</label>
                  <input style={inputStyle} value={formData.niche} onChange={set('niche')} placeholder="e.g. Fitness, Tech, Fashion" />
                </div>
                <div>
                  <label style={labelStyle}>Main Platform</label>
                  <select style={{ ...inputStyle, color: formData.platform ? '#fff' : 'rgba(255,255,255,0.4)' }} value={formData.platform} onChange={set('platform')}>
                    <option value="">Select Platform</option>
                    <option>Instagram</option>
                    <option>YouTube</option>
                    <option>TikTok</option>
                    <option>Twitter / X</option>
                    <option>LinkedIn</option>
                  </select>
                </div>
                <div>
                  <label style={labelStyle}>Profile URL</label>
                  <input style={inputStyle} value={formData.platformProfileUrl} onChange={set('platformProfileUrl')} placeholder="https://instagram.com/username" />
                </div>
                <div>
                  <label style={labelStyle}>Profile Picture URL</label>
                  <input style={inputStyle} value={formData.profilePicture} onChange={set('profilePicture')} placeholder="https://example.com/photo.jpg" />
                </div>
              </div>
              <div style={{ marginTop: 16 }}>
                <label style={labelStyle}>Bio</label>
                <textarea style={{ ...inputStyle, height: 80, resize: 'vertical' }} value={formData.bio} onChange={set('bio')} placeholder="Tell brands about yourself..." />
              </div>
            </div>

            <button className="save-btn" onClick={handleSave} disabled={saving} style={{
              background: saved ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
              border: 'none', color: '#fff', padding: '13px 32px', borderRadius: 10,
              fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
              alignSelf: 'flex-start', transition: 'all 0.2s ease', opacity: saving ? 0.7 : 1,
            }}>
              {saving ? 'Saving...' : saved ? '✓ Saved!' : 'Save Changes'}
            </button>
          </div>
        )}

        {/* Creator Stats Tab */}
        {activeTab === 'creator stats' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {/* Info Banner */}
            <div style={{ background: 'rgba(99,102,241,0.08)', border: '1px solid rgba(99,102,241,0.2)', borderRadius: 12, padding: '14px 18px', display: 'flex', alignItems: 'flex-start', gap: 12 }}>
              <span style={{ fontSize: 20 }}>ℹ️</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#818cf8', marginBottom: 4 }}>Why update your stats?</div>
                <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6 }}>
                  Brands can see your <strong style={{ color: '#fff' }}>followers, total likes, and total views</strong> when they accept your deal.
                  Keep these updated so brands get accurate insights about your reach.
                </div>
              </div>
            </div>

            <div style={{ background: '#0c0c10', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 }}>
              <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 20px' }}>Social Media Stats</h2>

              {/* Preview Cards */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 24 }}>
                {[
                  { icon: '👥', label: 'Followers', field: 'followers', color: '#6366f1', val: formData.followers },
                  { icon: '👤', label: 'Following', field: 'following', color: '#ec4899', val: formData.following },
                  { icon: '📸', label: 'Posts',     field: 'posts',     color: '#14b8a6', val: formData.posts },
                ].map(s => (
                  <div key={s.field} style={{ background: `${s.color}0e`, border: `1px solid ${s.color}28`, borderRadius: 12, padding: '16px 14px', textAlign: 'center' }}>
                    <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
                    <div style={{ fontSize: 20, fontWeight: 900, color: '#fff', lineHeight: 1 }}>
                      {s.val ? Number(s.val).toLocaleString() : '—'}
                    </div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginTop: 4 }}>{s.label}</div>
                  </div>
                ))}
              </div>

              {/* Input Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                <div>
                  <label style={labelStyle}>👥 Total Followers</label>
                  <input type="number" style={inputStyle} value={formData.followers} onChange={set('followers')} placeholder="e.g. 50000" min="0" />
                </div>
                <div>
                  <label style={labelStyle}>👤 Total Following</label>
                  <input type="number" style={inputStyle} value={formData.following} onChange={set('following')} placeholder="e.g. 500" min="0" />
                </div>
                <div>
                  <label style={labelStyle}>📸 Total Posts</label>
                  <input type="number" style={inputStyle} value={formData.posts} onChange={set('posts')} placeholder="e.g. 250" min="0" />
                </div>
                <div>
                  <label style={labelStyle}>📊 Average Engagement Rate</label>
                  <input type="text" style={inputStyle} value={formData.avgEngagement} onChange={set('avgEngagement')} placeholder="e.g. 4.5%" />
                </div>
              </div>
            </div>

            <button className="save-btn" onClick={handleSave} disabled={saving} style={{
              background: saved ? 'linear-gradient(135deg,#10b981,#059669)' : 'linear-gradient(135deg,#8b5cf6,#6d28d9)',
              border: 'none', color: '#fff', padding: '13px 32px', borderRadius: 10,
              fontSize: 14, fontWeight: 700, cursor: saving ? 'not-allowed' : 'pointer',
              alignSelf: 'flex-start', transition: 'all 0.2s ease', opacity: saving ? 0.7 : 1,
            }}>
              {saving ? 'Saving...' : saved ? '✓ Stats Saved!' : 'Update Stats'}
            </button>
          </div>
        )}

        {/* Security Tab */}
        {activeTab === 'security' && (
          <div style={{ background: '#0c0c10', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16, padding: 24 }}>
            <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 20px' }}>Security Settings</h2>
            <div style={{ display: 'grid', gap: 16 }}>
              {['Current Password', 'New Password', 'Confirm New Password'].map(lbl => (
                <div key={lbl}>
                  <label style={labelStyle}>{lbl}</label>
                  <input type="password" style={inputStyle} placeholder="••••••••" />
                </div>
              ))}
              <button style={{ background: 'linear-gradient(135deg,#8b5cf6,#6d28d9)', border: 'none', color: '#fff', padding: '12px 28px', borderRadius: 10, fontWeight: 700, fontSize: 13, cursor: 'pointer', alignSelf: 'flex-start' }}>
                Update Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
