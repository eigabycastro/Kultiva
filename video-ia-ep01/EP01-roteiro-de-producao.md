# EPISÓDIO 01 — O QUE É INTELIGÊNCIA ARTIFICIAL?
### Roteiro de produção completo · Animação 3D cinematográfica · Duração final: **≈ 8min05s**

> **Protagonista:** **BELLA**, a personagem das referências em `Documents/Edição com IA`.
> **Formato:** 16:9, 1080p ou 4K, 24 fps. Narração em português brasileiro, voz jovem feminina, leve, divertida e espontânea.
> **Total:** 52 tomadas de 7–10 s + vinheta + tela final.

---

## 0. MAPA DO EPISÓDIO

| # | Bloco | Início | Duração | Tomadas |
|---|-------|--------|---------|---------|
| 1 | Gancho — "Meu celular lê pensamentos?" | 0:00 | 75 s | 1.1 – 1.9 |
| — | Vinheta de abertura | 1:15 | 10 s | V |
| 2 | Conceito — o que é IA | 1:25 | 90 s | 2.1 – 2.10 |
| 3 | Exemplo cotidiano — como recomendações acham padrões | 2:55 | 80 s | 3.1 – 3.9 |
| 4 | IA no cotidiano — música, mapas, recomendações, jogos | 4:15 | 90 s | 4.1 – 4.10 |
| 5 | Limitações — a IA também erra | 5:45 | 70 s | 5.1 – 5.8 |
| 6 | Atividade e fechamento | 6:55 | 55 s | 6.1 – 6.6 |
| — | Tela final do YouTube (end screen) | 7:50 | 15 s | F |
| | **TOTAL** | | **≈ 8:05** | |

---

## 1. BLOCOS FIXOS DOS PROMPTS (consistência visual)

Cole **sempre** estes dois blocos no início de cada prompt de vídeo e anexe a **imagem de referência da protagonista** como *character reference / first frame* (image-to-video). Isso mantém rosto, cabelo, corpo e roupa idênticos em todas as tomadas.

**[CHARACTER LOCK]**
```
BELLA: the exact same teenage girl from the reference image, stylized 3D animated feature-film character, very long glossy straight black hair with a center part falling to her waist, big expressive dark brown eyes with long lashes, thick dark eyebrows, soft rounded face, light freckles and rosy cheeks, small nose, warm friendly smile, slim build. Outfit (never changes): oversized black hoodie with a small glowing cyan "</>" code symbol on the chest, thin silver necklace with a small four-petal flower pendant, light-blue wide-leg cargo jeans with side pockets, white chunky sneakers, small silver hoop earrings. No glasses. Personality: cute, playful, curious, spontaneous, very expressive natural facial animation. Identical face, hair, body and clothes in every shot.
```
> **Imagem de referência principal (anexar em toda geração):** `Edição com IA/Teen_girl_standing_smiling_75882b9c.jpg` (corpo inteiro). Para closes, anexe também `image.png_1c96604d.jpg` (rosto).
> O símbolo `</>` do moletom é a **única exceção** à regra de "nada de texto": ele faz parte do figurino.

**[ROOM LOCK]** (para todas as tomadas no quarto)
```
BELLA'S BEDROOM: cozy teen bedroom at night, purple neon LED strip along the ceiling edge, cyan LED strip under a wall shelf, warm table lamp on a wooden nightstand, bed with beige pillows and a soft pink-beige duvet, a small brown teddy bear on the bed, wooden bookshelf full of books, posters without readable text, a desk with a computer monitor showing abstract glowing shapes, window with blinds and the night city outside.
```

**[STYLE LOCK]**
```
High-end 3D animated feature film style, cinematic, Pixar/Disney-quality rendering, subsurface skin scattering, soft global illumination, detailed environments, shallow depth of field, smooth natural character motion, 24fps, 16:9, color palette of warm amber, soft lilac and electric cyan.
```

**[NEGATIVE PROMPT GLOBAL]** (use em todas as tomadas, somando os negativos específicos de cada cena)
```
text, letters, words, subtitles, captions, watermark, logo, brand names, real app interfaces, readable UI text, numbers on screen, gibberish writing, deformed face, inconsistent face, different hairstyle, short hair, wavy curly hair, blonde hair, glasses, changing outfit, hoodie without the code symbol, extra fingers, missing fingers, fused hands, distorted limbs, uncanny valley, photorealistic human, low poly, flat 2D, anime style, jittery motion, morphing, flickering, frame tearing, blurry, low resolution, oversaturated, horror mood, scary robot
```

> **Regra de ouro:** nenhuma imagem gerada deve conter texto. Telas de celular, TV e mapas mostram só ícones, formas, cores e miniaturas. **Todo texto entra na edição** (veja a coluna "Texto na edição").

---

## 1B. MATERIAL QUE JÁ EXISTE (pasta `Edição com IA`)

São 9 clipes de 8 s (1280×720, 24 fps), cerca de **72 s de vídeo já prontos**. Onde cada um entra:

| Clipe existente | O que mostra | Usar na tomada |
|---|---|---|
| `Girl_looking_up_with_smartphone` | Bella deitada mexendo no celular, depois se aproxima da câmera sorrindo | **1.2** (início) e **1.9** (final, quando ela fala com o público) |
| `Girl_looking_at_glowing_phone` | ri no celular → olhar desconfiado → close do celular com onda sonora | **1.3** (risada) e **1.4** (desconfiança) |
| `Girl_listening_to_music` | fones de ouvido, notas musicais flutuando | **1.5** (a música que ela cantarolava) |
| `Girl_holding_phone_with_holograms` | telas holográficas saem do celular e flutuam | **1.6** |
| `Bella_thinking_on_bed` | pensativa com "?" holográfico, depois vem até a câmera | **1.7** (ou abertura da Cena 2: "como ele sabe?") |
| `Woman_reacting_to_fading_holograms` | ícones holográficos em volta, ela cobre a boca surpresa | **1.8** (revelação) ou **3.8** (surpresa com o filhote) |
| `Bella_sits_on_bed_holding` | sentada de pernas cruzadas, acena e pisca | **6.1** / **6.4** (conversa com o público) |
| `Woman_tracing_holographic_city_map` | mapa holográfico com rota brilhante | **4.4 / 4.5** (mapas) |
| `Holographic_character_hops_on_desk` | cavaleiro de pixels holográfico pula na mesa | **4.7 / 4.8** (jogos) — ótima versão "dentro do quarto" |

**Atenção à continuidade (detectado nas referências):**
- **Óculos:** no clipe do mapa ela aparece de óculos, e nos outros, não. Escolha um padrão (o roteiro assume **sem óculos**) ou use esse clipe só nos quadros sem o rosto em close.
- **Cabelo:** nas imagens do Gemini o cabelo está ondulado; nos vídeos e na imagem de corpo inteiro, liso. O roteiro usa **liso**. Não use as imagens do Gemini como referência de geração.
- **Texto na cena:** o neon da parede tem letras embaralhadas ("DONE") e o monitor mostra linhas de código. Desfoque esses pontos na edição, ou recorte o quadro, e peça nas próximas gerações "neon sign shaped as a simple heart" / "monitor with abstract shapes".
- **Bit:** os vídeos não têm o orbe Bit. Ele é novo; se preferir, use um mascote holográfico como o cavaleiro de pixels.

---

## 2. CENA 1 — GANCHO: "MEU CELULAR LÊ PENSAMENTOS?"
**Duração:** 75 s (0:00 – 1:15)

**O que acontece:** à noite, Bella rola o feed no celular. Tudo que aparece é exatamente o que ela ama — gatinhos, a música que ela cantarolava. Ela desconfia, conversa com o celular, e ícones holográficos saem da tela e formam uma constelação neural ao redor dela. Ela descobre: é Inteligência Artificial.

**Protagonista:** relaxada → curiosa → desconfiada → dramática (sussurra para o celular) → encantada e animada ao falar com a câmera.

**Câmera:** abertura com *push-in* pela janela; close extremo dos olhos refletindo a tela; *dolly* lento; *orbit 360°* quando os ícones a rodeiam; termina em plano médio frontal (ela fala com o público).

**Ambiente:** o quarto da Bella das referências ([ROOM LOCK]): neon roxo no teto, LED ciano na prateleira, abajur quente, ursinho de pelúcia, estante de livros, escrivaninha com computador, janela com a cidade à noite.

**Iluminação:** neon roxo/lilás dominante + luz quente âmbar do abajur + luz ciano da tela iluminando o rosto dela. Na revelação, a luz ciano dos hologramas domina.

**Efeitos visuais:** reflexo da tela nos olhos; ícones holográficos (coração, nota musical, pata de gato, play) saindo do celular; partículas de luz; linhas brilhantes conectando os ícones como uma rede neural/constelação.

**Negativo específico:** `messy dark room, creepy atmosphere, horror lighting, phone with readable text`

**Efeitos sonoros:** ambiente noturno suave (grilos distantes, cidade ao longe); "plim" de notificação; miados fofos vindos dos vídeos; *whoosh* digital quando ícones saem; *hum* eletrônico crescente; *shimmer* mágico na revelação. **Trilha:** lo-fi fofo que vira tema misterioso leve (pizzicato + sintetizador).

### Tomadas

| Tomada | Duração | Ação | Narração (PT-BR) | Texto na edição |
|---|---|---|---|---|
| 1.1 | 7 s | Exterior: janela iluminada ao anoitecer; câmera atravessa a janela até Bella deitada na cama mexendo no celular. | *(só música e ambiente)* | — |
| 1.2 | 8 s | Close dos olhos dela refletindo a tela; ela sorri. | **BELLA (V.O.):** Sabe aquele momento em que você abre o celular só pra dar uma olhadinha rápida…? | — |
| 1.3 | 8 s | Ela ri de um vídeo de gatinho, desliza, outro gatinho, desliza, outro. | Primeiro vídeo: um gatinho. Segundo: outro gatinho. Terceiro… adivinha? | — |
| 1.4 | 8 s | Ela para, franze a testa, senta na cama desconfiada. | Peraí. Como é que ele sabe que eu amo gatos? | — |
| 1.5 | 8 s | Ela cantarola; a tela mostra uma capa de música pulsando; ela congela de olhos arregalados. | E a música que eu estava cantarolando agora há pouco… apareceu sozinha na minha lista! | — |
| 1.6 | 8 s | Ícones holográficos saem da tela e flutuam pelo quarto; ela olha em volta. | E ainda aparece: "talvez você goste disso". Talvez?! Ele sempre acerta! | "Talvez você goste disso" (balão estilo notificação) |
| 1.7 | 9 s | Ela aproxima o celular do rosto e sussurra, dramática. Zoom rápido cômico. | **BELLA (on):** Celular… você tá lendo meus pensamentos? | — |
| 1.8 | 9 s | Os ícones se ligam por linhas de luz formando uma constelação neural em volta dela; câmera orbita. | **BELLA (V.O.):** Não. Mas tem uma coisa trabalhando aqui dentro o tempo todo, aprendendo com cada toque meu. E ela tem nome… | — |
| 1.9 | 10 s | Ela vira para a câmera com um sorriso enorme, hologramas girando atrás. | **BELLA (on):** Inteligência Artificial! E o mais surpreendente: você também usa todos os dias, provavelmente sem perceber. Bora descobrir como? | **INTELIGÊNCIA ARTIFICIAL** (título animado) |

### Prompts em inglês

**1.1** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] Exterior establishing shot at blue-hour dusk of a cozy apartment window glowing with purple neon LED lights in a peaceful city. The camera slowly pushes in through the open window into a cozy bedroom and finds Bella lying on her bed on a beige duvet, scrolling her phone, cyan screen light on her face. Gentle breeze moves the curtains. Calm, intimate, curious mood.`

**1.2** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] Extreme close-up of Bella's big expressive eyes, the colorful glow of a phone screen reflected in her pupils, she blinks and smiles softly. Purple neon LED lights and a warm lamp blurred in the background bokeh, cyan rim light from the phone. Slow subtle dolly-in.`

**1.3** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] Medium close-up over Bella's shoulder: she lies on her bed swiping her phone; the screen shows only blurred colorful thumbnails of cute kittens, no text. She laughs, swipes, another kitten, laughs again, swipes, a third kitten. Playful comedic rhythm, soft handheld camera.`

**1.4** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] Bella stops smiling, squints suspiciously at her phone, slowly sits up on the bed and tilts her head, one eyebrow raised. Cozy bedroom with purple neon LED lights and plants. Slow push-in on her face, comedic suspense.`

**1.5** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] Bella hums a song happily with eyes half closed, then looks at her phone where a glowing abstract music album cover pulses with sound waves; she freezes, eyes wide open, mouth in a small "o". Quick snap zoom to her surprised face. Cyan light pulses on her skin.`

**1.6** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] Small glowing holographic icons (a heart, a music note, a cat paw, a play button, a star) float out of Bella's phone screen and drift around the cozy bedroom like fireflies. Bella looks around in amazement, following them with her eyes. Wide shot, slow dolly, magical cyan and lilac light particles.`

**1.7** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] Bella holds her phone very close to her face and whispers to it dramatically with narrowed eyes, as if interrogating it. Comedic fast zoom-in on her face, phone light from below, holographic icons floating softly in the background.`

**1.8** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] The floating holographic icons connect to each other with thin glowing cyan lines, forming a beautiful neural-network constellation that surrounds Bella sitting on her bed. The camera orbits 180 degrees around her as she watches in wonder, light reflecting on her face and hair. Sparkling particles, cinematic awe.`

**1.9** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] Bella turns toward the camera with a huge excited smile and speaks directly to the viewer with lively hand gestures, the glowing neural constellation rotating slowly behind her. Medium frontal shot, slight push-in, energetic and friendly.`

---

## VINHETA DE ABERTURA (10 s · 1:15 – 1:25)

**Ação:** partículas ciano e lilás formam um cérebro de luz que se transforma em um celular e depois explode em ícones. Silhueta de Bella acena no final.
**Texto na edição:** nome da série + **"EP. 01 — O que é Inteligência Artificial?"**
**SFX:** *whoosh* + acorde brilhante de sintetizador + "plim" final.

**Prompt:** `[STYLE LOCK] Abstract animated title sequence on a deep navy background: glowing cyan and lilac particles swirl and assemble into a luminous brain made of light, which morphs smoothly into a smartphone shape, then bursts into dozens of small glowing icons (heart, music note, map pin, game controller, cat paw). Center area left clean and empty for a title. Elegant, playful, cinematic.`
**Negativo:** global + `characters, faces, any text or letters`

---

## 3. CENA 2 — CONCEITO: O QUE É INTELIGÊNCIA ARTIFICIAL
**Duração:** 90 s (1:25 – 2:55)

**O que acontece:** Bella "mergulha" na tela do celular e cai num mundo digital. Lá conhece **Bit**, um pequeno orbe de luz com olhinhos (a personificação da IA). Ela ensina o Bit a reconhecer gatos mostrando muitos exemplos — explicando de forma visual como a IA aprende com dados e encontra padrões.

**Protagonista:** aventureira e didática; gesticula como professora divertida; carinhosa com o Bit.

**Câmera:** transição de mergulho em primeira pessoa para dentro da tela; plano aberto épico do mundo digital; *tracking* lateral enquanto ela anda; *close* nos padrões destacados; *crane up* no final.

**Ambiente:** mundo digital lindo: plataforma flutuante de vidro translúcido, rios de luz (fluxos de dados) correndo no céu, cubos e esferas geométricas flutuando, horizonte com névoa azul e lilás.

**Iluminação:** fria e mágica: ciano e violeta, contraluz forte, *glow* volumétrico, Bella com *rim light* ciano para destacar o cabelo preto.

**Efeitos visuais:** transição de mergulho em pixels; quatro orbes holográficos com ícones (livro, olho, caminho que se divide, balão de fala); cartões flutuantes com fotos de gatos variados; contornos brilhantes destacando orelhas e bigodes; fluxos de partículas entrando no Bit, que cresce e brilha.

**Personagem secundário — Bit:** `BIT: a tiny round floating orb of soft glowing cyan light, about the size of a grapefruit, with two big cute oval black eyes and expressive eyelids, no mouth, emits gentle particles, adorable and friendly, never menacing.`

**Negativo específico:** `scary robot, humanoid robot, terminator, red evil eyes, matrix green code, binary numbers, dark dystopia`

**Efeitos sonoros:** *whoosh* de mergulho + "splash" digital; ambiente etéreo de sintetizador; "bip-bip" fofo do Bit (como pios); *chime* ao reconhecer o gato; *swoosh* dos cartões; som de fluxo de dados (água digital).

### Tomadas

| Tomada | Duração | Ação | Narração (PT-BR) | Texto na edição |
|---|---|---|---|---|
| 2.1 | 8 s | Bella aproxima o rosto da tela e é "sugada" em um mergulho de pixels (POV). | **BELLA:** Pra entender a IA, bora dar um mergulho… direto pra dentro do celular! | — |
| 2.2 | 9 s | Ela pousa numa plataforma flutuante; plano aberto do mundo digital com rios de luz. | Inteligência Artificial é uma área da computação que cria sistemas capazes de realizar tarefas que normalmente precisariam da inteligência humana. | **Inteligência Artificial** = sistemas que fazem tarefas que exigiriam inteligência humana |
| 2.3 | 9 s | Ela abre os braços e quatro orbes com ícones surgem ao redor. | Tarefas como aprender, reconhecer padrões, tomar decisões e até entender a nossa linguagem. | APRENDER · RECONHECER PADRÕES · TOMAR DECISÕES · ENTENDER LINGUAGEM (um por orbe) |
| 2.4 | 9 s | Bit aparece de trás dela, tímido; ela se encanta. | Mas como uma máquina aprende? Do mesmo jeito que a gente aprende muita coisa: com exemplos. | — |
| 2.5 | 9 s | Bella faz surgir dezenas de cartões flutuantes com gatos diferentes e mostra ao Bit. | Imagina ensinar alguém a reconhecer um gato. Você mostra um gato, mais um, mais mil gatos diferentes… | — |
| 2.6 | 9 s | Contornos brilhantes destacam orelhas, bigodes e olhos em todos os gatos. | …até que ela percebe o que eles têm em comum: orelhas pontudas, bigodes e aquele olhar de quem é dono da casa. | "orelhas" · "bigodes" · "olhos" (setinhas) |
| 2.7 | 8 s | Um gato novo aparece; Bit brilha verde e pula de alegria; Bella comemora. | Aí, quando aparece um gato que ela nunca viu antes… ela reconhece! | ✔ GATO! |
| 2.8 | 9 s | Fluxos de partículas entram no Bit, que cresce e brilha mais forte. | Esses exemplos são os **dados**. Quanto mais dados de qualidade, melhor a IA aprende. | **DADOS** |
| 2.9 | 10 s | Bella se agacha frente a frente com o Bit; ele "dá de ombros" girando. | Mas atenção: a IA não pensa nem sente como a gente. Ela não tem consciência. Ela calcula, compara e encontra padrões — muito rápido! | IA ≠ cérebro humano |
| 2.10 | 10 s | *Crane up*: Bella e Bit na plataforma, imensidão digital ao redor. | Ou seja: a IA é uma ferramenta superpoderosa para encontrar padrões. E é exatamente isso que acontece no seu celular. | — |

### Prompts em inglês

**2.1** — `[CHARACTER LOCK] [STYLE LOCK] Bella brings her face close to her glowing phone screen; the screen ripples like water and she is pulled inside in a spectacular first-person dive through tunnels of colorful pixels and streaks of cyan light. Fast dynamic camera, exhilarating, magical.`

**2.2** — `[CHARACTER LOCK] [STYLE LOCK] Wide epic shot: Bella lands gracefully on a floating translucent glass platform inside a vast beautiful digital world, rivers of flowing light streaming across a violet sky, floating geometric cubes and spheres, misty blue horizon. Her long black hair settles, cyan rim light. She looks around amazed. Slow crane down.`

**2.3** — `[CHARACTER LOCK] [STYLE LOCK] Bella opens her arms on the glowing platform and four floating holographic orbs appear around her, each containing a simple glowing symbol: an open book, an eye, a path splitting in two, a speech bubble with no letters. Camera slowly orbits. Teacher-like playful gestures, volumetric glow.`

**2.4** — `[CHARACTER LOCK] [STYLE LOCK] [BIT] A tiny cute glowing cyan orb with big oval eyes peeks shyly from behind Bella's shoulder; Bella turns, gasps happily and smiles at it, hands near her cheeks. Medium two-shot, soft particles, adorable first-meeting moment.`

**2.5** — `[CHARACTER LOCK] [STYLE LOCK] [BIT] Bella waves her hand and dozens of floating glowing picture cards appear in the air around her, each showing a different cute cat (orange, black, white, striped, fluffy, small, big). She presents them to Bit, who looks from card to card. Tracking shot, cards drifting in 3D space, no text.`

**2.6** — `[CHARACTER LOCK] [STYLE LOCK] [BIT] Close-up of floating cat picture cards; glowing cyan outlines trace the pointy ears, the whiskers and the eyes of every cat simultaneously, revealing the common pattern. Bit's eyes widen with understanding. Bella nods proudly in soft focus. Elegant VFX.`

**2.7** — `[CHARACTER LOCK] [STYLE LOCK] [BIT] A brand-new cat card floats in front of Bit; Bit glows bright green, bounces happily in the air and spins; Bella jumps and celebrates with both fists up, laughing. Joyful medium shot, sparkles burst.`

**2.8** — `[CHARACTER LOCK] [STYLE LOCK] [BIT] Streams of glowing data particles flow from every direction like luminous rivers into Bit, who grows slightly bigger and shines brighter; Bella watches with her hair gently blown by the energy. Low-angle shot, volumetric light, epic but cute.`

**2.9** — `[CHARACTER LOCK] [STYLE LOCK] [BIT] Bella crouches down face to face with Bit, explaining with a gentle raised finger; Bit tilts and rotates in a cute shrug-like motion, blinking. Intimate close two-shot, soft cyan glow, warm affectionate mood.`

**2.10** — `[CHARACTER LOCK] [STYLE LOCK] [BIT] Crane-up wide shot: Bella stands on the floating glass platform with Bit hovering beside her shoulder, both looking at an immense luminous digital landscape with rivers of light and floating shapes. Bella points into the distance. Grand, inspiring finale.`

---

## 4. CENA 3 — EXEMPLO COTIDIANO: COMO AS RECOMENDAÇÕES ACHAM PADRÕES
**Duração:** 80 s (2:55 – 4:15)

**O que acontece:** Bella "rebobina" a noite e revê suas ações em câmera lenta. Cada toque dela no celular deixa um rastro de luz (dados). Bit coleta essas pistas, organiza o padrão "ama gatos à noite", escolhe vídeos numa biblioteca gigante e compara com milhões de pessoas — e um filhote de cachorro aparece no feed dela.

**Protagonista:** observadora, como uma detetive investigando a si mesma; risadas ao se reconhecer; surpresa ao ver o filhote.

**Câmera:** efeito de rebobinar; câmera lenta em *macro* no dedo tocando a tela; plano aéreo da biblioteca de vídeos; *pull-back* revelando milhares de pessoas; finaliza em *close* frontal.

**Ambiente:** o quarto da Cena 1 (mesmo layout) com sobreposição holográfica; uma "biblioteca infinita" digital de miniaturas flutuantes; um espaço noturno com silhuetas luminosas de pessoas.

**Iluminação:** quarto quente âmbar; rastros de dados em ciano; momentos de "pista importante" com brilho dourado; trilhos esmaecidos em cinza para vídeos pulados.

**Efeitos visuais:** rebobinar com *glitch* suave; partículas saindo do dedo; partículas douradas (curtir/compartilhar) vs. cinza (pular); Bit organizando partículas em um aglomerado de ícones de pata; biblioteca de miniaturas em espiral; rede de silhuetas conectadas.

**Negativo específico:** `surveillance camera, spying eyes, creepy tracking, dark paranoia, readable usernames`

**Efeitos sonoros:** som de fita rebobinando; *tick* em câmera lenta a cada toque; "plim" dourado ao curtir; som abafado ao pular vídeo; "bip" do Bit pensando; ambiente coral eletrônico na cena das pessoas; latido fofo de filhote.

### Tomadas

| Tomada | Duração | Ação | Narração (PT-BR) | Texto na edição |
|---|---|---|---|---|
| 3.1 | 8 s | Bella e Bit de volta ao quarto; tudo rebobina rapidamente. | **BELLA:** Lembra dos vídeos de gatinho? Vamos voltar no tempo e ver o que aconteceu de verdade. | ◀◀ REBOBINANDO |
| 3.2 | 9 s | Câmera lenta: o dedo dela toca a tela e um rastro de partículas de luz sai dele. | Cada vez que você assiste a um vídeo até o final, isso vira uma informação. | — |
| 3.3 | 9 s | Ela curte, compartilha, reassiste; partículas douradas se acumulam no ar. | Curtiu? Informação. Mandou pra amiga? Informação. Assistiu de novo? Mais informação! | CURTIR · COMPARTILHAR · REASSISTIR |
| 3.4 | 9 s | Ela desliza rápido um vídeo de culinária; partícula cinza e apagada cai. | E quando você pula um vídeo em dois segundos… isso também diz muita coisa. | — |
| 3.5 | 9 s | Bit puxa todas as partículas e as organiza num aglomerado brilhante de patinhas e lua. | A IA junta todas essas pistas e procura padrões: "ela sempre assiste vídeos de gatos até o fim, principalmente à noite". | PADRÃO: 🐱 + 🌙 |
| 3.6 | 9 s | Bit voa por uma biblioteca infinita de miniaturas e puxa as de gatos para a frente. | Com esse padrão, ela calcula quais vídeos têm mais chance de você gostar… e coloca eles na sua frente. | — |
| 3.7 | 9 s | *Pull-back*: milhares de silhuetas luminosas com seus rastros, conectadas por fios. | E tem mais: ela compara você com milhões de pessoas com gostos parecidos. Quem ama gatos, muitas vezes também ama… cachorrinhos fofos! | — |
| 3.8 | 9 s | De volta ao quarto: um filhote aparece na tela; ela leva a mão ao peito, encantada. | E pronto: um filhote aparece no seu feed. E você pensa: "Como ele sabia?" | — |
| 3.9 | 9 s | Ela para a câmera, tocando a têmpora com o dedo, piscando. | Não é mágica, nem leitura de mente. É **reconhecimento de padrões** a partir dos seus dados. | **RECONHECIMENTO DE PADRÕES** |

### Prompts em inglês

**3.1** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] [BIT] Bella and Bit reappear in her cozy bedroom with purple neon LED lights; the whole scene rewinds rapidly with a soft digital glitch, objects and light moving backwards, until it settles on her lying on the bed with her phone. Playful time-rewind effect, warm amber lighting.`

**3.2** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] Extreme slow-motion macro shot: Bella's fingertip taps her phone screen showing a blurred kitten thumbnail, and a delicate trail of glowing cyan particles rises from her fingertip into the air. Shallow depth of field, warm bokeh background.`

**3.3** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] Bella taps her phone happily several times; with each tap a small burst of golden glowing particles floats up and accumulates in the air above her like a little galaxy. She smiles. Medium shot, gentle push-in, cozy bedroom.`

**3.4** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] Bella quickly swipes past a blurry food video on her phone with a bored face; a single dim grey particle falls slowly and fades out. Comedic contrast, close-up on her hand and face.`

**3.5** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] [BIT] Bit hovers above the bed and pulls all the floating golden and cyan particles toward itself like a magnet, arranging them into a glowing cluster of cat-paw shapes next to a small crescent moon symbol. Bella watches, chin on her hands, fascinated. Magical VFX, slow orbit.`

**3.6** — `[CHARACTER LOCK] [STYLE LOCK] [BIT] Bit flies through an infinite spiral library of floating glowing video thumbnails (blurred, no text) in a vast digital space, picking the ones with cats and pulling them forward into a neat row. Dynamic tracking camera following Bit, sense of scale and speed.`

**3.7** — `[STYLE LOCK] [BIT] Huge pull-back aerial shot: thousands of small glowing human silhouettes standing in a dark blue digital space, each with its own trail of light, many of them connected by thin glowing threads forming clusters; Bit floats in the middle. Awe-inspiring, beautiful, not scary.`

**3.8** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] Back in the cozy bedroom: Bella's phone screen shows a blurred adorable puppy; she gasps with delight, puts her hand on her chest, eyes sparkling, then looks at the phone suspiciously-amused. Close-up, warm light, comedic timing.`

**3.9** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] [BIT] Bella looks into the camera and taps her temple with her index finger, then winks confidently; Bit hovers next to her head and blinks. Frontal medium close-up, cozy bokeh background, clever friendly tone.`

---

## 5. CENA 4 — IA NO COTIDIANO
**Duração:** 90 s (4:15 – 5:45)

**O que acontece:** amanhece. Bella sai pela cidade e começa a "enxergar" a IA em tudo: a playlist personalizada, o mapa que desvia do trânsito, recomendações de compras e de séries, o videogame que se adapta a ela, desbloqueio facial, corretor e assistente de voz. Termina num terraço ao pôr do sol com a cidade inteira atravessada por fios de luz.

**Protagonista:** animada, em movimento, curiosa; dança um pouco com a música; competitiva e divertida no videogame.

**Câmera:** *steadicam* acompanhando na rua; *whip pans* entre exemplos; plano aéreo de drone sobre a cidade com o mapa holográfico; *over-the-shoulder* no videogame; montagem rápida; plano aberto no terraço.

**Ambiente:** bairro urbano colorido e arborizado de manhã; ciclovia; vitrine de loja; sala de estar aconchegante com TV e videogame (tarde/noite); terraço com vista para a cidade.

**Iluminação:** manhã dourada e suave; dia claro; sala com luz da TV; pôr do sol laranja-rosado no final, com fios de luz ciano sobre a cidade.

**Efeitos visuais:** ondas sonoras coloridas que pintam a rua; disco/fita de playlist feita de ondas; mapa holográfico gigante sobre a cidade com ruas vermelhas e rota ciano; miniaturas flutuantes na vitrine; inimigos do jogo com brilho de "aprendizado"; grade de reconhecimento facial suave; fios de luz ligando a cidade.

**Negativo específico:** `real brand logos, recognizable app UI, real streaming service logos, real game characters, violent game, gore, traffic accident`

**Efeitos sonoros:** pássaros e cidade de manhã; música da playlist subindo do fone; campainha de bicicleta; "recalculando" (bip suave); sininho de loja; sons de videogame retrô fofos; *click* de câmera/desbloqueio; *whooshes* de montagem; vento no terraço.

### Tomadas

| Tomada | Duração | Ação | Narração (PT-BR) | Texto na edição |
|---|---|---|---|---|
| 4.1 | 8 s | Manhã: Bella sai do prédio com fone de ouvido, Bit no ombro; o sol nasce. | **BELLA:** Agora que você já sabe o segredo, repara: a IA está em todo lugar! | — |
| 4.2 | 9 s | Ela anda dançando; ondas sonoras coloridas saem do fone e pintam a calçada. | Na **música**: o aplicativo monta playlists só pra você, misturando o que você já ama com novidades parecidas. | 🎵 MÚSICA |
| 4.3 | 9 s | As ondas se juntam formando um disco de luz que gira; o céu muda de manhã para noite num *timelapse* rápido e a música muda. | Ele analisa o ritmo, o estilo e até o horário em que você escuta: música animada de manhã, música calminha à noite. | — |
| 4.4 | 9 s | Bella de bicicleta; um mapa holográfico gigante se abre sobre a cidade com ruas vermelhas. | Nos **mapas**: a IA analisa o trânsito em tempo real, com dados de milhares de celulares, e prevê quanto tempo você vai levar. | 🗺️ MAPAS |
| 4.5 | 9 s | Uma rota ciano se redesenha desviando do engarrafamento; ela vira na rua alternativa sorrindo. | Se tem engarrafamento, ela encontra um caminho alternativo antes mesmo de você chegar lá. | — |
| 4.6 | 9 s | Vitrine com produtos flutuando em hologramas; corte para Bella no sofá com TV mostrando miniaturas sem texto. | Nas **compras** e nos **filmes**: "quem comprou isso também comprou aquilo", "porque você assistiu a esta série…" | 🛍️ RECOMENDAÇÕES |
| 4.7 | 9 s | Bella joga videogame no sofá; inimigos fofos na TV reagem às jogadas dela. | Nos **jogos**: personagens controlados pelo computador reagem às suas jogadas, e o desafio se ajusta ao seu nível. | 🎮 JOGOS |
| 4.8 | 9 s | Ela repete o mesmo golpe; o inimigo desvia; ela faz cara de indignada e depois ri. | Toda vez que você repete a mesma estratégia… o jogo aprende a se defender! | — |
| 4.9 | 9 s | Montagem rápida: desbloqueio facial, digitação com corretor, ela falando com assistente de voz, filtro de foto. | E ainda tem o desbloqueio pelo rosto, o corretor do teclado, os assistentes de voz, os filtros de foto… | — |
| 4.10 | 10 s | Terraço ao pôr do sol; a cidade é atravessada por fios de luz; Bella e Bit contemplam. | A Inteligência Artificial não é coisa de filme do futuro. Ela já faz parte da nossa rotina — de manhã até a hora de dormir. | — |

### Prompts em inglês

**4.1** — `[CHARACTER LOCK] [STYLE LOCK] [BIT] Golden morning: Bella steps out of a charming apartment building onto a colorful tree-lined street, wearing white headphones, Bit floating at her shoulder; she stretches happily as sunlight hits her face. Steadicam tracking shot, birds flying, fresh joyful mood.`

**4.2** — `[CHARACTER LOCK] [STYLE LOCK] Bella walks down the sunny sidewalk bobbing her head and doing small dance steps; colorful glowing sound waves flow out of her headphones and paint the pavement and walls with ribbons of light as she passes. Side tracking shot, playful musical energy.`

**4.3** — `[CHARACTER LOCK] [STYLE LOCK] The colorful sound waves around Bella twist together into a spinning glowing vinyl disc of light floating in front of her; a fast timelapse turns the sky from bright morning to calm starry night, the light ribbons shift from orange to soft blue. Bella sways calmly. Dreamy transition.`

**4.4** — `[CHARACTER LOCK] [STYLE LOCK] Drone aerial shot: Bella rides a bicycle on a bike lane through a lively city; a gigantic translucent holographic map unfolds in the sky above the streets, some streets glowing red with traffic, dots of light moving along them. Sweeping camera, cinematic scale.`

**4.5** — `[CHARACTER LOCK] [STYLE LOCK] On the holographic city map, a glowing cyan route line smoothly redraws itself to avoid a red congested avenue; Bella, on her bicycle, turns into a quiet tree-lined side street with a satisfied smile. Dynamic follow camera, smooth motion.`

**4.6** — `[CHARACTER LOCK] [STYLE LOCK] Bella passes a stylish shop window where glowing holographic products (sneakers, backpack, headphones) float and rotate toward her; whip-pan transition to Bella on a cozy sofa at home, the TV showing a grid of blurred colorful show thumbnails with no text, one gently highlighted. Smooth, playful.`

**4.7** — `[CHARACTER LOCK] [STYLE LOCK] Over-the-shoulder shot: Bella sits cross-legged on the sofa playing a video game with a controller, the TV shows a cute colorful fantasy game with round friendly cartoon creatures that dodge and react to her moves, each creature with a faint glowing aura. TV light on her focused face.`

**4.8** — `[CHARACTER LOCK] [STYLE LOCK] Bella repeats the same move on her controller; on the TV the cute game creature cleverly dodges again; Bella drops her jaw in comic outrage, then bursts out laughing, falling back on the sofa cushions. Close-up reaction, comedic timing.`

**4.9** — `[CHARACTER LOCK] [STYLE LOCK] Fast stylish montage with whip-pan transitions: Bella's face lit by a soft glowing scanning grid as her phone unlocks; her thumbs typing as small sparkles fix a word (no readable text); Bella speaking to a small glowing smart speaker that pulses with light; Bella taking a selfie with a cute sparkly filter effect. Energetic rhythm.`

**4.10** — `[CHARACTER LOCK] [STYLE LOCK] [BIT] Rooftop at sunset: Bella sits on the edge of a safe rooftop terrace with Bit beside her, looking over a beautiful city; thousands of thin glowing cyan threads connect homes, cars, phones and buildings across the orange-pink sky. Slow wide pull-back, contemplative and wonderful.`

---

## 6. CENA 5 — LIMITAÇÕES: A IA TAMBÉM ERRA
**Duração:** 70 s (5:45 – 6:55)

**O que acontece:** momento cômico. O app de fotos confunde o bolinho dela com um cachorro; o feed dela vira só fraldas depois de comprar um presente de chá de bebê; o mapa a manda para uma rua fechada. Bit fica confuso. Bella explica dados ruins, viés e a importância do senso crítico — e "pega o volante".

**Protagonista:** cômica, olhar "sério?" para a câmera, depois madura e firme ao falar de senso crítico.

**Câmera:** *zoom* cômico (estilo comédia); câmera fixa para o *deadpan*; *dutch angle* leve na confusão do Bit; plano frontal estável na mensagem final.

**Ambiente:** cozinha/café com bancada (bolinho); o quarto; a rua com um portão/rua fechada por barreiras de obra coloridas; o mundo digital de volta para a explicação de viés.

**Iluminação:** clara e divertida nas piadas; luz levemente avermelhada/alerta nos erros do Bit; volta a ficar quente e confiável no conselho final.

**Efeitos visuais:** moldura holográfica de reconhecimento em volta do bolinho com ícone de cachorro; chuva de ícones de fralda/mamadeira; Bit com "suor" de partículas e ponto de interrogação luminoso; balança desequilibrada com cartões; gato preto não reconhecido (Bit fica vermelho).

**Negativo específico:** `sad crying, real injury, car crash, angry mood, mean-spirited, offensive stereotypes, real people faces`

**Efeitos sonoros:** som de "erro" cômico (buzina de game show); trombone triste "wah-wah"; chuva de "plins" de notificação; Bit fazendo "bip?" confuso; freio de bicicleta; música volta séria e acolhedora no final.

### Tomadas

| Tomada | Duração | Ação | Narração (PT-BR) | Texto na edição |
|---|---|---|---|---|
| 5.1 | 8 s | Bella na cozinha com um bolinho de mirtilo; aponta o celular para fotografar. | **BELLA:** Mas calma… a IA é incrível, mas não é perfeita. Olha só isso. | — |
| 5.2 | 9 s | Moldura holográfica envolve o bolinho e mostra ícone de cachorro; Bella olha para a câmera, *deadpan*. | Meu aplicativo de fotos achou que esse bolinho… era um cachorro. Sério. | "Cachorro" (rótulo errado) ❌ |
| 5.3 | 9 s | No quarto, ícones de fraldas e mamadeiras chovem do celular sobre ela. | E depois que eu comprei UM presente de chá de bebê pra minha prima… meu feed só me mostra fraldas! | — |
| 5.4 | 9 s | No mundo digital, Bit fica confuso, girando, com partículas de "suor" e um ponto de interrogação. | Isso acontece porque a IA aprende com dados. Se os dados são poucos, confusos ou incompletos, ela tira conclusões erradas. | DADOS RUINS → CONCLUSÕES ERRADAS |
| 5.5 | 9 s | Bit foi treinado só com gatos laranjas; um gato preto aparece e ele fica vermelho, sem reconhecer. | E se ela aprende só com um tipo de exemplo, pode tratar pessoas e situações de forma injusta. Isso se chama **viés**. | **VIÉS** |
| 5.6 | 9 s | Bella de bicicleta segue a rota; chega numa rua fechada com barreiras coloridas; freia e coça a cabeça. | E ela erra no mundo real também: um mapa desatualizado pode mandar você direto pra uma rua fechada. | — |
| 5.7 | 9 s | Bella acaricia o Bit com carinho e retoma o controle (segura o guidão / guarda o celular, olhando a rua com atenção). | Por isso, a regra de ouro é: a IA ajuda, mas quem decide é você. Use o seu senso crítico! | **A IA AJUDA. QUEM DECIDE É VOCÊ.** |
| 5.8 | 8 s | Plano frontal, Bella sorrindo, firme e amigável. | Desconfie, confira as informações e lembre: por trás de toda IA existem pessoas, dados e escolhas. | — |

### Prompts em inglês

**5.1** — `[CHARACTER LOCK] [STYLE LOCK] Bright cozy kitchen: Bella proudly holds a small blueberry muffin on a plate next to the counter and aims her phone camera at it with a cheerful face. Bright natural daylight, plants on the windowsill, medium shot.`

**5.2** — `[CHARACTER LOCK] [STYLE LOCK] A glowing holographic recognition frame snaps around the blueberry muffin and a cute glowing dog-face icon pops up above it; comic zoom on the muffin, then cut to Bella slowly turning to look at the camera with a flat deadpan expression, one eyebrow raised. Comedic timing.`

**5.3** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] Bella sits on her bed holding her phone as dozens of glowing holographic icons of baby diapers, baby bottles and pacifiers pour out of the screen and rain down on her like confetti; she covers her face and laughs in disbelief. Cozy bedroom, comedic chaos.`

**5.4** — `[STYLE LOCK] [BIT] Inside the digital world, Bit spins confusedly in the air, its glow flickering between cyan and orange, small droplets of light flying off it like sweat, a glowing question-mark shape hovering above it, scattered messy data particles around. Slight dutch angle, cute and funny.`

**5.5** — `[STYLE LOCK] [BIT] In the digital world, a row of floating cards showing only orange cats; Bit happily looks at them; then a card with a black cat appears, Bit stares, its glow turns red and it backs away confused. A glowing balance scale nearby tips heavily to one side. Clear visual storytelling.`

**5.6** — `[CHARACTER LOCK] [STYLE LOCK] Bella rides her bicycle following a glowing cyan route line on the street, which leads straight into a closed street blocked by colorful construction barriers and cones; she brakes, stops, and scratches her head with a puzzled smile. Daylight, wide shot, lighthearted.`

**5.7** — `[CHARACTER LOCK] [STYLE LOCK] [BIT] Bella gently pats Bit like a pet, smiling kindly, then puts her phone in her pocket, grips her bicycle handlebars confidently and looks around the street with attentive eyes before choosing her own way. Medium shot, warm reassuring light.`

**5.8** — `[CHARACTER LOCK] [STYLE LOCK] Frontal medium close-up: Bella looks straight into the camera with a warm, confident, friendly smile and speaks sincerely with small hand gestures; soft warm background bokeh of the city. Stable camera, trustworthy tone.`

---

## 7. CENA 6 — ATIVIDADE E FECHAMENTO
**Duração:** 55 s (6:55 – 7:50)

**O que acontece:** de volta ao quarto à noite, Bella lança o desafio: encontrar três exemplos de IA no dia a dia e escrever nos comentários. Três "cartões de luz" vazios aparecem e ela preenche com ícones. Ela convida a se inscrever e, no fim, o celular sugere mais um vídeo de gatinho — ela ri, se rende, e a câmera sai pela janela, fechando o ciclo da abertura.

**Protagonista:** calorosa, próxima do público, cúmplice; final engraçado e fofo.

**Câmera:** plano frontal em altura dos olhos (conversa com o público); *push-in* lento; *tilt down* quando aponta os comentários; *pull-out* pela janela no final (espelhando a tomada 1.1).

**Ambiente:** o mesmo quarto da Cena 1, agora com caderno e canetas coloridas na cama; mesma janela e luzinhas.

**Iluminação:** noite aconchegante: neon roxo, abajur quente, brilho ciano dos cartões; última tomada com a cidade noturna cheia de luzes.

**Efeitos visuais:** três cartões holográficos vazios; ícones voando para dentro deles (TV, controle, carro, mochila escolar); Bit dormindo como uma luzinha suave; fios de luz na cidade no *pull-out* final.

**Negativo específico:** `text inside the cards, written words in the notebook, readable handwriting`

**Efeitos sonoros:** "plim" de cada cartão aparecendo; rabisco de caneta; "plop" fofo dos ícones; som de sininho (inscrição); miado final; trilha retorna ao tema lo-fi e cresce no encerramento.

### Tomadas

| Tomada | Duração | Ação | Narração (PT-BR) | Texto na edição |
|---|---|---|---|---|
| 6.1 | 9 s | Bella sentada de pernas cruzadas na cama, caderno no colo, fala com a câmera. | **BELLA (on):** E aí, gostou de descobrir que a IA está tão pertinho de você? Agora é a sua vez! | — |
| 6.2 | 10 s | Três cartões holográficos vazios surgem ao lado dela, um de cada vez. | **Desafio do dia:** observe a sua rotina e encontre três exemplos de Inteligência Artificial que você usa no seu dia a dia. | **DESAFIO: 3 EXEMPLOS DE IA NO SEU DIA** · 1 · 2 · 3 |
| 6.3 | 9 s | Ela escreve no caderno; ícones (TV, controle, carro, mochila) voam e preenchem os cartões. | Pode ser no celular, na TV, no videogame, no carro, na escola… vale tudo! | — |
| 6.4 | 9 s | Ela aponta para baixo, animada, piscando. | Escreve os seus três exemplos aqui nos comentários! Eu vou adorar ler — e quem sabe você encontra um que ninguém pensou? | 💬 COMENTE SEUS 3 EXEMPLOS |
| 6.5 | 9 s | Ela segura o celular e faz o gesto de tocar um sininho no ar; Bit cochila brilhando suave. | Isso foi só o começo da nossa jornada pela Inteligência Artificial. Se inscreve e ativa o sininho pra não perder o próximo episódio! | INSCREVA-SE 🔔 |
| 6.6 | 9 s | O celular mostra outro gatinho; ela ri e se rende, deita; câmera sai pela janela para a cidade cheia de fios de luz. | **BELLA (rindo):** Tá bom, IA… só mais um vídeo de gatinho. | **"Eu uso Inteligência Artificial todos os dias… e nem percebia!"** |

### Prompts em inglês

**6.1** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] Night, cozy bedroom with purple neon lights and a warm table lamp: Bella sits cross-legged on her bed with a notebook on her lap and colorful pens, looking straight at the camera and talking warmly with expressive hands. Eye-level frontal medium shot, slow push-in.`

**6.2** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] Three empty glowing holographic cards appear one by one in the air beside Bella with a soft pop of light; she gestures toward them like presenting a challenge, excited eyebrows raised. Clean empty card surfaces, cyan glow, cozy night bedroom.`

**6.3** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] Bella writes quickly in her notebook with a playful smile (no readable writing); small glowing icons — a TV, a game controller, a car, a school backpack — fly out of the notebook and land inside the three floating holographic cards, filling them. Magical playful VFX, gentle orbit.`

**6.4** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] Bella leans toward the camera, points downward with both index fingers enthusiastically, then winks and smiles. Frontal close-up, slight tilt down following her fingers, purple neon bokeh.`

**6.5** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] [BIT] Bella mimes ringing a little bell in the air with a cheerful face, a small glowing bell-shaped sparkle appears at her fingertips; beside her on the pillow, Bit dozes with its eyes closed, glowing softly like a night light. Cute, warm, medium shot.`

**6.6** — `[CHARACTER LOCK] [STYLE LOCK] [ROOM LOCK] [BIT] Bella's phone lights up with a blurred cute kitten thumbnail; she laughs, gives up with a shrug and lies back on her pillows watching it. The camera slowly pulls back out through the bedroom window into the night, revealing the whole city glowing with thin cyan threads of light connecting every window. Mirror of the opening shot, heartwarming ending.`

---

## TELA FINAL — END SCREEN (15 s · 7:50 – 8:05)
**Ação:** Bella e Bit acenando no canto direito; espaço livre à esquerda para os elementos do YouTube (vídeo sugerido + botão de inscrição).
**Prompt:** `[CHARACTER LOCK] [STYLE LOCK] [BIT] Bella and Bit wave goodbye happily on the right third of the frame, soft looping idle animation, the left two-thirds is a clean softly glowing navy and lilac gradient background with floating particles, left empty for overlays.`
**Negativo:** global + `objects on the left side, busy background`
**SFX:** trilha final em *fade out*.

---

## 8. TODOS OS TEXTOS DA EDIÇÃO (lista para o editor)

| Tempo aprox. | Texto | Estilo sugerido |
|---|---|---|
| 0:51 | "Talvez você goste disso" | balão de notificação arredondado |
| 1:05 | INTELIGÊNCIA ARTIFICIAL | título grande, brilho ciano |
| 1:15 | [Nome da série] — EP. 01: O que é Inteligência Artificial? | vinheta |
| 1:33 | Inteligência Artificial = sistemas que fazem tarefas que exigiriam inteligência humana | *lower third* |
| 1:42 | APRENDER · RECONHECER PADRÕES · TOMAR DECISÕES · ENTENDER LINGUAGEM | um rótulo por orbe |
| 2:17 | orelhas · bigodes · olhos | setinhas desenhadas à mão |
| 2:26 | ✔ GATO! | selo verde |
| 2:34 | DADOS | palavra-chave |
| 2:43 | IA ≠ cérebro humano | palavra-chave |
| 2:55 | ◀◀ REBOBINANDO | estilo VHS |
| 3:12 | CURTIR · COMPARTILHAR · REASSISTIR | ícones + palavras |
| 3:30 | PADRÃO: 🐱 + 🌙 | cartão |
| 4:06 | RECONHECIMENTO DE PADRÕES | palavra-chave grande |
| 4:23 / 4:41 / 4:59 / 5:17 | 🎵 MÚSICA · 🗺️ MAPAS · 🛍️ RECOMENDAÇÕES · 🎮 JOGOS | etiqueta de capítulo |
| 5:53 | "Cachorro" ❌ | rótulo de app riscado |
| 6:12 | DADOS RUINS → CONCLUSÕES ERRADAS | palavra-chave |
| 6:21 | VIÉS | palavra-chave + definição curta |
| 6:39 | A IA AJUDA. QUEM DECIDE É VOCÊ. | frase de destaque |
| 7:04 | DESAFIO: 3 EXEMPLOS DE IA NO SEU DIA | cartão grande + 1, 2, 3 |
| 7:22 | 💬 COMENTE SEUS 3 EXEMPLOS | seta para baixo |
| 7:31 | INSCREVA-SE 🔔 | animação de botão |
| 7:41 | "Eu uso Inteligência Artificial todos os dias… e nem percebia!" | frase final centralizada |

**Capítulos do YouTube (cole na descrição):**
```
0:00 Meu celular lê pensamentos?
1:25 O que é Inteligência Artificial
2:55 Como as recomendações descobrem do que você gosta
4:15 A IA no seu dia a dia
5:45 A IA também erra
6:55 Desafio: 3 exemplos de IA
```

---

## 9. GUIA DE PÓS-PRODUÇÃO

1. **Narração primeiro:** grave (ou gere com voz sintética PT-BR jovem feminina) a narração tomada por tomada. Ela define o tempo final de cada corte; ajuste as tomadas de 5–10 s ao áudio.
2. **Geração dos vídeos:** gere cada tomada em *image-to-video* com a imagem de referência da protagonista. Gere 2–3 variações por tomada e escolha a mais fiel ao rosto/cabelo/roupa. Para tomadas seguidas no mesmo ambiente, use o último quadro da tomada anterior como primeiro quadro da seguinte.
3. **Falas "on" (diante da câmera):** 1.7, 1.9, 6.1–6.6 e 5.8 — aplique *lip-sync* se a ferramenta permitir; nas demais, a narração é *voice-over*.
4. **Montagem:** cortes no ritmo da fala, *whooshes* nas transições, *J-cuts* (áudio entra antes da imagem) nas mudanças de cena.
5. **Trilha:** lo-fi fofo como tema principal; variação misteriosa no gancho; variação épica/etérea no mundo digital; variação cômica na Cena 5. Abaixe a trilha para −18 a −22 dB sob a narração.
6. **Legendas:** gere legendas em PT-BR (acessibilidade e retenção).
7. **Exportação:** 1920×1080 ou 3840×2160, 24 fps, H.264/H.265, áudio AAC 48 kHz, loudness −14 LUFS.

---

## 10. PACOTE DO YOUTUBE

**Título:** Você usa INTELIGÊNCIA ARTIFICIAL todo dia e nem percebe! 🤖 | Ep. 01
**Título alternativo:** O que é Inteligência Artificial? (explicado de um jeito fofo)

**Thumbnail (prompt de imagem):** `[CHARACTER LOCK] [STYLE LOCK] Close-up of Bella with a hilariously shocked face, wide eyes and open mouth, holding her glowing phone, holographic icons (cat paw, music note, map pin, game controller) exploding out of the screen, bright cyan and lilac background, space on the left for a title, ultra vibrant, high contrast.`
**Texto da thumbnail (na edição):** "ELE SABE TUDO?!"

**Descrição:**
```
Seu celular parece ler seus pensamentos? 😳 Neste primeiro episódio, a Bella descobre que usa Inteligência Artificial o tempo todo — nos vídeos recomendados, nas músicas, nos mapas e até nos jogos!

Você vai aprender:
✔ O que é Inteligência Artificial
✔ Como a IA aprende com dados e reconhece padrões
✔ Onde a IA aparece no seu dia a dia
✔ Por que a IA também erra (e por que você deve usar o senso crítico)

🎯 DESAFIO: comente 3 exemplos de IA que você usa no seu dia a dia!

[capítulos]
```
**Tags:** inteligência artificial, o que é IA, IA explicada, IA no dia a dia, como funciona a IA, algoritmo, recomendações, educação, tecnologia para crianças, aprendizado de máquina
