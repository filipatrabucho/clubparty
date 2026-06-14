import { Link } from 'react-router-dom';

export default function Rules() {
  return (
    <div className="rules-page">
      <div className="rules-container">
        <Link to="/" className="back-link">← Voltar à página inicial</Link>

        <h1>Regras do Servidor</h1>
        <p className="rules-intro">
          Para garantirmos que o Club Party continua a ser um espaço seguro,
          divertido e respeitoso para todos, pedimos que leias e sigas as regras abaixo.
        </p>

        <section className="rules-section">
          <h2>1. Mandamentos Básicos</h2>
          <ul className="rules-list">
            <li>Não compartilhes informações pessoais sem o consentimento da pessoa.</li>
            <li>Não perturbes membros que estejam a utilizar os canais de voz.</li>
            <li>Não é permitido gravar a voz de outros utilizadores sem a permissão dos mesmos.</li>
            <li>Não é permitido iniciar lives sem aviso prévio aos membros no canal de voz ou chat.</li>
            <li>Não partilhes links indesejados ou de phishing.</li>
            <li>Não é permitido spam.</li>
            <li>Não é permitido partilhar links de publicidade no chat geral do servidor. Para esse efeito, deve ser usado o canal de Share Projects.</li>
            <li>É permitido convidar amigos para o servidor, mas devem usar o teu próprio link de convite.</li>
          </ul>
        </section>

        <section className="rules-section">
          <h2>1.1. Mandamentos Estruturais</h2>
          <ul className="rules-list">
            <li>Respeita o próximo — deves o respeito a ti e a todos os membros deste servidor.</li>
            <li>Assédio sexual ou abuso verbal a membros, tanto em chats e canais de voz como em mensagens privadas, são proibidos e punidos.</li>
            <li>Qualquer ato de racismo, xenofobia, homofobia ou qualquer outro tipo de discriminação para com membros deste servidor são proibidos e punidos.</li>
            <li>O envio ou publicação de conteúdos (pessoais ou não) com violência explícita, conotação sexual, conteúdo sexual explícito, abuso, pedofilia, violência geral, pornografia ou quaisquer outros conteúdos considerados inapropriados, tanto no servidor como por mensagem privada a membros, são proibidos e punidos.</li>
            <li>Em caso de incumprimento, desrespeito ou infração no servidor (direta ou indiretamente), os moderadores/administradores podem punir a qualquer momento os membros em causa, mesmo que já tenham passado horas ou dias desde o acontecimento.</li>
          </ul>
        </section>

        <section className="rules-section">
          <h2>2. Cargos Extra</h2>
          <p className="rules-text">
            Ao convidares mais pessoas para o servidor, qualificas-te para subir de
            "Membro" para os seguintes cargos:
          </p>
          <div className="roles-table">
            <div className="roles-table-row">
              <span className="roles-table-count">3 a 5 novos membros</span>
              <span className="roles-table-badge roles-badge-bronze">Bronze</span>
            </div>
            <div className="roles-table-row">
              <span className="roles-table-count">6 a 10 novos membros</span>
              <span className="roles-table-badge roles-badge-silver">Silver</span>
            </div>
            <div className="roles-table-row">
              <span className="roles-table-count">11 a 30 novos membros</span>
              <span className="roles-table-badge roles-badge-gold">Gold</span>
            </div>
            <div className="roles-table-row">
              <span className="roles-table-count">31 a 60 novos membros</span>
              <span className="roles-table-badge roles-badge-diamond">Diamond</span>
            </div>
            <div className="roles-table-row">
              <span className="roles-table-count">60+ novos membros</span>
              <span className="roles-table-badge roles-badge-emerald">Emerald</span>
            </div>
          </div>
        </section>

        <div className="rules-cta">
          <p>Tens dúvidas sobre alguma regra?</p>
          <a href="https://discord.gg/QkhJmtQgk3" className="button">Falar com a Staff no Discord</a>
        </div>
      </div>
    </div>
  );
}