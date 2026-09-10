import { useEffect, useState } from "react";
import "./Landingpage.css";
import { Link } from "react-router-dom";
import Logotipo from "../../assets/logo/Logo_MoveTec.png";
import Logo from "../../assets/logo/Logo (2).png";


export default function Landing() {
  const [progressoScroll, setProgressoScroll] = useState(0);
  const [porcentagemHover, setPorcentagemHover] = useState(0);

  // Barra de progresso do scroll da página
  useEffect(() => {
    function calcularProgresso() {
      const alturaTotal = document.documentElement.scrollHeight - window.innerHeight;
      const rolado = window.scrollY;
      const percentual = alturaTotal > 0 ? (rolado / alturaTotal) * 100 : 0;
      setProgressoScroll(percentual);
    }

    window.addEventListener("scroll", calcularProgresso);
    calcularProgresso();

    return () => window.removeEventListener("scroll", calcularProgresso);
  }, []);

  // Animação de contagem ao passar o mouse na Hero
  const handleMouseEnterPhone = () => {
    let atual = 0;
    const meta = 78;
    const intervalo = setInterval(() => {
      atual += 2;
      if (atual >= meta) {
        atual = meta;
        clearInterval(intervalo);
      }
      setPorcentagemHover(atual);
    }, 20);
  };

  const handleMouseLeavePhone = () => {
    setPorcentagemHover(0);
  };

  const circunferencia = 339.29;
  const dashoffset = circunferencia - (circunferencia * porcentagemHover) / 100;

  return (
    <div className="landing">


      {/* HEADER FIXO */}
      <header className="landing-header">
        <div className="header-text">
          <img src={Logo} alt="Logo da marca" className="logo-img" />
        </div>
        <div className="header-buttons">
          <Link to="/login" className="btn btn-outline">Login</Link>
        </div>

        <div className="scroll-progress-trilha">
          <div
            className="scroll-progress-barra"
            style={{ width: `${progressoScroll}%` }}
          />
        </div>
      </header>

      {/* SEÇÃO 1 - CLARA (HERO) */}
      <section className="hero-section">
        <div className="hero-text">
          <img src={Logotipo} alt="Prévia do aplicativo" className="phone-image" />
          <h2>Onde a mudança <span className="destaque-tinta">começa.</span></h2>
          
          <div className="hero-subtext-container">
            <p>
              Acompanhe seus treinos, conquiste pontos e mantenha o hábito da
              atividade física junto com seus amigos.
            </p>
            
            {/* Rabisco em Zig-Zag */}
            <svg 
              className="rabisco-marca-texto" 
              viewBox="0 0 400 20" 
              fill="none" 
              xmlns="http://www.w3.org/2000/svg"
            >
              <path 
                d="M5 12 L 35 4 L 65 16 L 95 4 L 125 16 L 155 4 L 185 16 L 215 4 L 245 16 L 275 4 L 305 16 L 335 4 L 365 16 L 395 6" 
                stroke="var(--laranja-move)" 
                strokeWidth="6" 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                opacity="0.85"
              />
            </svg>
          </div>
        </div>

        <div className="hero-mockup">
          <div 
            className="device-container"
            onMouseEnter={handleMouseEnterPhone}
            onMouseLeave={handleMouseLeavePhone}
          >
            <div className="floating-badge">
              <span className="badge-icon">🔥</span>
              <div>
                <strong>Em alta!</strong>
                <p>Sua comunidade bateu a meta</p>
              </div>
            </div>

            {/* MOLDURA CELULAR (Exibido em telas menores) */}
            <div className="phone-frame mobile-only">
              <div className="progress-ring-wrap">
                <svg className="progress-ring" viewBox="0 0 120 120" aria-hidden="true">
                  <circle className="progress-ring-trilha" cx="60" cy="60" r="54" />
                  <circle
                    className="progress-ring-preenchido"
                    cx="60"
                    cy="60"
                    r="54"
                    style={{ strokeDashoffset: dashoffset }}
                  />
                </svg>
                <div className="progress-ring-texto">
                  <strong>{porcentagemHover}%</strong>
                  <span>Meta semanal</span>
                  <span className="subtexto-hover">
                    {porcentagemHover > 0 ? "Que semana incrível!" : "Passe o mouse!"}
                  </span>
                </div>
              </div>
            </div>

            {/* MOLDURA DESKTOP (Exibido em telas grandes) */}
            <div className="desktop-wrapper desktop-only">
              <div className="desktop-frame">
                <div className="desktop-top-bar">
                  <div className="desktop-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
                <div className="desktop-screen-content">
                  <div className="progress-ring-wrap">
                    <svg className="progress-ring" viewBox="0 0 120 120" aria-hidden="true">
                      <circle className="progress-ring-trilha" cx="60" cy="60" r="54" />
                      <circle
                        className="progress-ring-preenchido"
                        cx="60"
                        cy="60"
                        r="54"
                        style={{ strokeDashoffset: dashoffset }}
                      />
                    </svg>
                    <div className="progress-ring-texto">
                      <strong>{porcentagemHover}%</strong>
                      <span>Meta semanal</span>
                      <span className="subtexto-hover">
                        {porcentagemHover > 0 ? "Que semana incrível!" : "Passe o mouse!"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="desktop-stand"></div>
              <div className="desktop-base"></div>
            </div>

          </div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee">
        <div className="marquee-track">
          <div className="marquee-card"><span className="marquee-icon">🏃</span><span>Rankings semanais</span></div>
          <div className="marquee-card"><span className="marquee-icon">🔥</span><span>Streaks diárias</span></div>
          <div className="marquee-card"><span className="marquee-icon">🏆</span><span>Badges e conquistas</span></div>
          <div className="marquee-card"><span className="marquee-icon">👥</span><span>Comunidade da turma</span></div>
          <div className="marquee-card"><span className="marquee-icon">📊</span><span>Acompanhamento de progresso</span></div>
          <div className="marquee-card"><span className="marquee-icon">✅</span><span>Validação do professor</span></div>

          <div className="marquee-card"><span className="marquee-icon">🏃</span><span>Rankings semanais</span></div>
          <div className="marquee-card"><span className="marquee-icon">🔥</span><span>Streaks diárias</span></div>
          <div className="marquee-card"><span className="marquee-icon">🏆</span><span>Badges e conquistas</span></div>
          <div className="marquee-card"><span className="marquee-icon">👥</span><span>Comunidade da turma</span></div>
          <div className="marquee-card"><span className="marquee-icon">📊</span><span>Acompanhamento de progresso</span></div>
          <div className="marquee-card"><span className="marquee-icon">✅</span><span>Validação do professor</span></div>
        </div>
      </div>

      {/* SEÇÃO 2 - ESCURA */}
      <section className="dark-section">
        <div className="dark-mockup">
          <div className="device-container">
            <div className="floating-badge badge-dark">
              <span className="badge-icon">🏆</span>
              <div>
                <strong>Top 1!</strong>
                <p>Lívia liderando este mês</p>
              </div>
            </div>

            {/* CELULAR (Telas Menores) */}
            <div className="phone-frame phone-frame-dark mobile-only">
              <div className="app-preview-content">
                <div className="app-header-preview">
                  <span>Ranking</span>
                  <span className="live-dot">● Ao vivo</span>
                </div>

                <div className="ranking-preview-list">
                  <div className="ranking-item gold">
                    <span className="pos">1º</span>
                    <div className="avatar">👩‍🎓</div>
                    <div className="user-info"><strong>Lívia Q.</strong></div>
                    <span className="streak">🔥 12</span>
                  </div>
                  <div className="ranking-item silver">
                    <span className="pos">2º</span>
                    <div className="avatar">👨‍🎓</div>
                    <div className="user-info"><strong>Milton A.</strong></div>
                    <span className="streak">🔥 8</span>
                  </div>
                  <div className="ranking-item bronze">
                    <span className="pos">3º</span>
                    <div className="avatar">👩‍🎓</div>
                    <div className="user-info"><strong>Camila P.</strong></div>
                    <span className="streak">🔥 5</span>
                  </div>
                </div>

                <div className="app-badge-unlocked">
                  <span>🎉 Meta Coletiva Batida!</span>
                </div>
              </div>
            </div>

            {/* DESKTOP (Telas Grandes) */}
            <div className="desktop-wrapper desktop-only">
              <div className="desktop-frame desktop-frame-dark">
                <div className="desktop-top-bar">
                  <div className="desktop-dots">
                    <span></span><span></span><span></span>
                  </div>
                </div>
                <div className="desktop-screen-content">
                  <div className="app-preview-content">
                    <div className="app-header-preview">
                      <span>Ranking</span>
                      <span className="live-dot">● Ao vivo</span>
                    </div>

                    <div className="ranking-preview-list">
                      <div className="ranking-item gold">
                        <span className="pos">1º</span>
                        <div className="avatar">👩‍🎓</div>
                        <div className="user-info"><strong>Lívia Q.</strong></div>
                        <span className="streak">🔥 12</span>
                      </div>
                      <div className="ranking-item silver">
                        <span className="pos">2º</span>
                        <div className="avatar">👨‍🎓</div>
                        <div className="user-info"><strong>Milton A.</strong></div>
                        <span className="streak">🔥 8</span>
                      </div>
                      <div className="ranking-item bronze">
                        <span className="pos">3º</span>
                        <div className="avatar">👩‍🎓</div>
                        <div className="user-info"><strong>Camila P.</strong></div>
                        <span className="streak">🔥 5</span>
                      </div>
                    </div>

                    <div className="app-badge-unlocked">
                      <span>🎉 Meta Coletiva Batida!</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="desktop-stand"></div>
              <div className="desktop-base"></div>
            </div>

          </div>
        </div>

        <div className="dark-text">
          <h2>
            Simples de usar. <br />
            <span className="destaque-tinta">Fácil de manter</span> o hábito.
          </h2>
          <p>
            Feito para todos os alunos, em qualquer lugar. Rotinas rápidas
            pra te ajudar a manter a constância sem complicação.
          </p>

          <div className="feature-card">
            <div className="feature-header">
              <span className="feature-icon">🏆</span>
              <h3>Rankings e conquistas</h3>
            </div>
            <p>Pontue praticando exercícios, suba no ranking e desbloqueie badges exclusivas por streaks diárias.</p>
          </div>

          <div className="feature-card">
            <div className="feature-header">
              <span className="feature-icon">👥</span>
              <h3>Comunidade</h3>
            </div>
            <p>Acompanhe a evolução dos seus amigos, envie incentivos e comemorem juntos as metas alcançadas.</p>
          </div>
        </div>
      </section>

      {/* SEÇÃO 3 - INFORMATIVA E PROPÓSITO */}
      <section className="info-section">
        <div className="benefits-marquee">
          <div className="benefits-track">
            <div className="benefit-card"><span className="benefit-icon">❤️</span><h4>Saúde do coração</h4><p>Melhora a circulação e reduz riscos cardiovasculares.</p></div>
            <div className="benefit-card"><span className="benefit-icon">🧠</span><h4>Foco e concentração</h4><p>Ajuda no rendimento escolar e na disposição mental.</p></div>
            <div className="benefit-card"><span className="benefit-icon">😴</span><h4>Sono de qualidade</h4><p>Regula o sono e melhora o descanso do corpo.</p></div>
            <div className="benefit-card"><span className="benefit-icon">💪</span><h4>Força e disposição</h4><p>Aumenta a energia para as atividades do dia a dia.</p></div>
            <div className="benefit-card"><span className="benefit-icon">🙂</span><h4>Bem-estar emocional</h4><p>Reduz estresse, ansiedade e sintomas de tristeza.</p></div>

            <div className="benefit-card"><span className="benefit-icon">❤️</span><h4>Saúde do coração</h4><p>Melhora a circulação e reduz riscos cardiovasculares.</p></div>
            <div className="benefit-card"><span className="benefit-icon">🧠</span><h4>Foco e concentração</h4><p>Ajuda no rendimento escolar e na disposição mental.</p></div>
            <div className="benefit-card"><span className="benefit-icon">😴</span><h4>Sono de qualidade</h4><p>Regula o sono e melhora o descanso do corpo.</p></div>
            <div className="benefit-card"><span className="benefit-icon">💪</span><h4>Força e disposição</h4><p>Aumenta a energia para as atividades do dia a dia.</p></div>
            <div className="benefit-card"><span className="benefit-icon">🙂</span><h4>Bem-estar emocional</h4><p>Reduz estresse, ansiedade e sintomas de tristeza.</p></div>
          </div>
        </div>

        <div className="info-content">
          <div className="info-visual-card">
            <div className="visual-card-badge">📊 Dado Importante</div>
            <div className="impact-number">84%</div>
            <p className="impact-desc">dos jovens não atingem a meta diária recomendada de atividade física pela OMS.</p>
            
            <div className="mini-chart">
              <div className="chart-bar" style={{ height: "40%" }}><span>ativos</span></div>
              <div className="chart-bar active" style={{ height: "90%" }}><span>sedentários</span></div>
            </div>
          </div>

          <div className="info-text">
            <span className="section-tag">NOSSO PROPÓSITO</span>
            <h2>Por que isso <span className="destaque-tinta">importa?</span></h2>
            <p>
              Estudos apontam que a falta de movimento afeta diretamente a saúde e o foco dos estudantes. 
              O <strong>MoveTec</strong> nasce para mudar essa realidade de forma engajadora, transformando 
              o exercício em um momento leve, acompanhado e cheio de motivação entre colegas de turma.
            </p>
            
            <div className="info-bullets">
              <div className="bullet-item">
                <span className="bullet-icon">⚡</span>
                <span><strong>Hábito Sustentável:</strong> Rotinas adaptadas à vida escolar.</span>
              </div>
              <div className="bullet-item">
                <span className="bullet-icon">🤝</span>
                <span><strong>Apoio Coletivo:</strong> Colegas motivando colegas todos os dias.</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RODAPÉ */}
      <footer className="footer">
        <div className="footer-content">
          <div className="footer-institution">
            <h3>Etec de Campo Limpo Paulista</h3>
            <p>Trabalho de Conclusão de Curso — 2026</p>
          </div>

          <div className="footer-columns">
            <div className="footer-column">
              <h4>Alunos</h4>
              <ul>
                <li>Camila</li>
                <li>Lívia</li>
                <li>Milton</li>
              </ul>
            </div>

            <div className="footer-column">
              <h4>Orientadoras</h4>
              <ul>
                <li>Thaynara</li>
                <li>Barbara</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="footer-bottom">
          <p>&copy; 2026 — Todos os direitos reservados</p>
        </div>
      </footer>
    </div>
  );
}