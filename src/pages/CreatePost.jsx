import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/useAuth';

export default function CreatePost() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const fileInputRef = useRef(null);

  const [channels, setChannels] = useState([]);
  const [channelSearch, setChannelSearch] = useState('');
  const [channelDropdownOpen, setChannelDropdownOpen] = useState(false);

  const [form, setForm] = useState({
    title: '',
    content: '',
    image_url: '',
    target_channel_id: '',
    target_channel_name: '',
  });

  const [imagePreview, setImagePreview] = useState(null);
  const [imageMode, setImageMode] = useState('url'); // 'url' ou 'upload'
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState(null); // null | 'loading' | 'success' | 'error'
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    fetch('/.netlify/functions/get-channels')
      .then(res => res.json())
      .then(data => setChannels(data.channels || []));
  }, []);

  useEffect(() => {
    if (imageMode === 'url' && form.image_url) {
      setImagePreview(form.image_url);
    }
  }, [form.image_url, imageMode]);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  // Converte imagem para base64 e faz upload via Supabase Storage (ou imgbb)
  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file) return;

    // Preview local imediato
    const reader = new FileReader();
    reader.onload = (ev) => setImagePreview(ev.target.result);
    reader.readAsDataURL(file);

    setUploading(true);

    // Upload para imgbb (gratuito, sem conta necessária para testar)
    // Mais tarde podes trocar por Supabase Storage
    const formData = new FormData();
    formData.append('image', file);

    try {
      const res = await fetch(
        `https://api.imgbb.com/1/upload?key=${import.meta.env.VITE_IMGBB_API_KEY}`,
        { method: 'POST', body: formData }
      );
      const data = await res.json();
      if (data.success) {
        setForm(prev => ({ ...prev, image_url: data.data.url }));
      } else {
        alert('Erro ao fazer upload da imagem');
      }
    } catch {
      alert('Erro ao fazer upload da imagem');
    }

    setUploading(false);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.target_channel_id) {
      setErrorMsg('Seleciona um canal de destino.');
      return;
    }
    setStatus('loading');
    setErrorMsg('');

    const res = await fetch('/.netlify/functions/publish-post', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        title: form.title,
        content: form.content,
        image_url: form.image_url || null,
        target_channel_id: form.target_channel_id,
      }),
    });

    if (res.ok) {
      setStatus('success');
      setTimeout(() => navigate('/dashboard'), 1500);
    } else {
      const data = await res.json();
      const discordError = data?.error;
      let msg = 'Erro ao publicar.';

      if (typeof discordError === 'string') {
        msg = discordError;
      } else if (discordError?.message) {
        msg = discordError.message;
      }

      console.log('Erro publish-post:', JSON.stringify(discordError, null, 2));
      setErrorMsg(msg);
      setStatus('error');
    }
  }

  const filteredChannels = channels.filter(c =>
    c.name.toLowerCase().includes(channelSearch.toLowerCase())
  );

  return (
    <div className="create-post-page">
      <div className="create-post-header">
        <Link to="/dashboard" className="back-link">← Voltar ao Dashboard</Link>
        <h1>Nova Publicação</h1>
        <p className="dashboard-welcome">Publica um anúncio num canal do Discord</p>
      </div>

      <div className="create-post-layout">
        {/* FORMULÁRIO */}
        <div className="create-post-form-wrapper">
          <form onSubmit={handleSubmit} className="post-form">

            {/* TÍTULO */}
            <div className="form-group">
              <label>Título *</label>
              <input
                name="title"
                className="form-input"
                placeholder="Ex: Evento de fim de semana 🎉"
                value={form.title}
                onChange={handleChange}
                required
              />
            </div>

            {/* CONTEÚDO */}
            <div className="form-group">
              <label>Conteúdo *</label>
              <textarea
                name="content"
                className="form-input form-textarea"
                placeholder="Escreve o conteúdo do anúncio aqui..."
                rows={7}
                value={form.content}
                onChange={handleChange}
                required
              />
              <span className="form-hint">Podes usar **negrito**, *itálico* e `código` (Markdown do Discord)</span>
            </div>

            {/* IMAGEM */}
            <div className="form-group">
              <label>Imagem (opcional)</label>
              <div className="image-mode-tabs">
                <button
                  type="button"
                  className={`image-tab ${imageMode === 'url' ? 'active' : ''}`}
                  onClick={() => { setImageMode('url'); setImagePreview(null); setForm(p => ({ ...p, image_url: '' })); }}
                >
                  🔗 URL
                </button>
                <button
                  type="button"
                  className={`image-tab ${imageMode === 'upload' ? 'active' : ''}`}
                  onClick={() => { setImageMode('upload'); setImagePreview(null); setForm(p => ({ ...p, image_url: '' })); }}
                >
                  📁 Upload
                </button>
              </div>

              {imageMode === 'url' ? (
                <input
                  name="image_url"
                  className="form-input"
                  placeholder="https://exemplo.com/imagem.png"
                  value={form.image_url}
                  onChange={handleChange}
                />
              ) : (
                <div
                  className="upload-area"
                  onClick={() => fileInputRef.current?.click()}
                >
                  {uploading ? (
                    <p>A fazer upload...</p>
                  ) : imagePreview ? (
                    <img src={imagePreview} alt="Preview" className="upload-preview" />
                  ) : (
                    <>
                      <span className="upload-icon">📷</span>
                      <p>Clica para escolher uma imagem</p>
                      <span className="form-hint">PNG, JPG, GIF até 10MB</span>
                    </>
                  )}
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    onChange={handleImageUpload}
                  />
                </div>
              )}

              {imagePreview && !uploading && (
                <button
                  type="button"
                  className="filter-clear"
                  style={{ marginTop: '0.5rem' }}
                  onClick={() => { setImagePreview(null); setForm(p => ({ ...p, image_url: '' })); if (fileInputRef.current) fileInputRef.current.value = ''; }}
                >
                  ✕ Remover imagem
                </button>
              )}
            </div>

            {/* CANAL */}
            <div className="form-group">
              <label>Canal de destino *</label>
              <div className="role-combobox">
                <input
                  className="form-input"
                  placeholder="🔍 Pesquisar canal..."
                  value={channelSearch || form.target_channel_name}
                  onChange={e => { setChannelSearch(e.target.value); setChannelDropdownOpen(true); }}
                  onFocus={() => { setChannelSearch(''); setChannelDropdownOpen(true); }}
                  onBlur={() => setTimeout(() => setChannelDropdownOpen(false), 150)}
                />
                {channelDropdownOpen && (
                  <div className="role-dropdown">
                    {filteredChannels.length === 0 ? (
                      <div className="role-option role-option-empty">Nenhum canal encontrado</div>
                    ) : filteredChannels.map(c => (
                      <div
                        key={c.id}
                        className="role-option"
                        onMouseDown={() => {
                          setForm(p => ({ ...p, target_channel_id: c.id, target_channel_name: c.name }));
                          setChannelSearch('');
                          setChannelDropdownOpen(false);
                        }}
                      >
                        # {c.name}
                      </div>
                    ))}
                  </div>
                )}
              </div>
              {form.target_channel_name && (
                <span className="form-hint">Canal selecionado: <strong>#{form.target_channel_name}</strong></span>
              )}
            </div>

            {errorMsg && <p className="form-error">{errorMsg}</p>}

            <button
              type="submit"
              className="button"
              disabled={status === 'loading'}
              style={{ width: '100%', justifyContent: 'center', marginTop: '0.5rem' }}
            >
              {status === 'loading' ? 'A publicar...' : '🚀 Publicar no Discord'}
            </button>

            {status === 'success' && (
              <p className="form-success">✅ Publicado com sucesso! A redirecionar...</p>
            )}
          </form>
        </div>

        {/* PREVIEW DO EMBED */}
        <div className="embed-preview-wrapper">
          <h3>Preview do embed</h3>
          <div className="discord-embed">
            <div className="discord-embed-bar" />
            <div className="discord-embed-content">
              {form.title && <div className="discord-embed-title">{form.title}</div>}
              {form.content && (
                <div className="discord-embed-description">
                  {form.content.split('\n').map((line, i) => (
                    <span key={i}>{line}<br /></span>
                  ))}
                </div>
              )}
              {imagePreview && (
                <img src={imagePreview} alt="Imagem" className="discord-embed-image" />
              )}
              <div className="discord-embed-footer">
                <span>Club Party</span>
                <span>{new Date().toLocaleDateString('pt-PT')}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}