import uuid
from datetime import datetime
from typing import List, Dict, Any

SEED_PEOPLE = [
    {
        "name": "Elena Rostova",
        "headline": "Lead AI Research Scientist at Anthropic | LLM Alignment & Multi-Agent Systems",
        "linkedin_url": "https://www.linkedin.com/in/elena-rostova-ai",
        "instagram_url": "https://www.instagram.com/elena.runs.trails",
        "profile_image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        "skills": ["LLM Alignment", "PyTorch", "Multi-Agent Coordination", "Reinforcement Learning", "Distributed Systems"],
        "hobbies": ["Trail Running", "Espresso Brewing", "Analog Synthesizers", "Sci-Fi Literature"],
        "projects": ["Constitutional AI benchmark evaluator", "Distributed agent communication protocol"],
        "topics": ["Mathematical guarantees in RLHF", "High-altitude marathon pacing", "Modular Eurorack synth patches"],
        "li_evidence": ["Published author at NeurIPS on cooperative multi-agent dynamics", "Lead Scientist at frontier AI lab"],
        "ig_evidence": ["Photos documenting Sierra Nevada 50k ultramarathon finish", "Latte art and custom manual lever espresso setup"]
    },
    {
        "name": "Marcus Vance",
        "headline": "Founding Engineer at Linear | Systems Architect & Rust Core Contributor",
        "linkedin_url": "https://www.linkedin.com/in/marcus-vance-systems",
        "instagram_url": "https://www.instagram.com/marcus.codes.climb",
        "profile_image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        "skills": ["Rust", "Local-First Sync", "WebAssembly", "CRDTs", "High-Throughput Databases"],
        "hobbies": ["Bouldering", "Woodworking", "Mechanical Keyboards", "Pour-Over Coffee"],
        "projects": ["Zero-copy CRDT library in Rust", "Custom split ergonomic keyboard PCB design"],
        "topics": ["Conflict-free replicated data types in offline apps", "V8 boulder problem beta", "Walnut dovetail joints"],
        "li_evidence": ["Designed real-time sync engine handling 100k msg/sec", "Rust compiler contributor"],
        "ig_evidence": ["Climbing session reels at Dogpatch Boulders SF", "Handmade walnut monitor stand workshop photos"]
    },
    {
        "name": "Aria Patel",
        "headline": "Principal Product Designer at Stripe | Design Systems & Micro-Interactions",
        "linkedin_url": "https://www.linkedin.com/in/aria-patel-design",
        "instagram_url": "https://www.instagram.com/aria.frames.light",
        "profile_image": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=80",
        "skills": ["Design Systems", "Figma", "Design Tokens", "Interaction Design", "Typography"],
        "hobbies": ["35mm Film Photography", "Ceramics", "Modern Architecture", "Cycling"],
        "projects": ["Stripe global dashboard component library", "Independent photo essay on brutalist architecture"],
        "topics": ["Fluid typography scales", "Leica M6 Kodak Portra 400 emulsions", "Wheel-thrown porcelain glazing"],
        "li_evidence": ["Keynote speaker at Config on design token automation", "Spearheaded accessibility redesign"],
        "ig_evidence": ["Grid of street architecture shot on Kodak Tri-X 400", "Studio ceramics showcase with matte reactive glazes"]
    },
    {
        "name": "Julian Cho",
        "headline": "Co-Founder & CEO at Decibel Robotics | Autonomous Drone Navigation",
        "linkedin_url": "https://www.linkedin.com/in/julian-cho-robotics",
        "instagram_url": "https://www.instagram.com/julian.sky.lab",
        "profile_image": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=400&auto=format&fit=crop&q=80",
        "skills": ["Robotics", "ROS 2", "SLAM", "Edge Compute", "C++", "Hardware Prototyping"],
        "hobbies": ["FPV Drone Racing", "Mountain Biking", "Electronic Music Production", "Surfing"],
        "projects": ["Sub-millisecond optical flow localization on micro-controllers", "Y Combinator W23 alumnus"],
        "topics": ["Visual inertial odometry in GPS-denied environments", "Ableton Live generative beats", "Marin headlands downhill trails"],
        "li_evidence": ["Raised $12M Series A for industrial inspection drones", "Stanford Robotics lab alumnus"],
        "ig_evidence": ["Acrobatic FPV drone flight footage through redwoods", "Surf session sunrise at Ocean Beach SF"]
    },
    {
        "name": "Siddharth Nair",
        "headline": "Staff Machine Learning Engineer at Databricks | Open Source LLM Infra",
        "linkedin_url": "https://www.linkedin.com/in/siddharth-nair-ml",
        "instagram_url": "https://www.instagram.com/sid.brews.and.runs",
        "profile_image": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
        "skills": ["vLLM", "CUDA", "Model Quantization", "Ray Cluster Optimization", "Python"],
        "hobbies": ["Specialty Coffee Brewing", "Half-Marathon Training", "Chess Tactics", "Vinyl Records"],
        "projects": ["Triton kernel optimizations for sparse attention", "Top 50 contributor on vLLM"],
        "topics": ["PagedAttention memory efficiency", "Ethiopian natural process pour-overs", "Sicilian Defense variations"],
        "li_evidence": ["Co-authored paper on high-throughput serving for 70B parameter models", "Apache Spark committer"],
        "ig_evidence": ["Fellow Ode grinder review and brew recipes", "Finish line photo from SF Half Marathon with medal"]
    },
    {
        "name": "Chloe Dupont",
        "headline": "VP of Engineering at Watershed | Climate Tech & Sustainability Data Platforms",
        "linkedin_url": "https://www.linkedin.com/in/chloe-dupont-climate",
        "instagram_url": "https://www.instagram.com/chloe.alpine.adventures",
        "profile_image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
        "skills": ["Data Engineering", "Distributed Analytics", "Carbon Accounting", "Go", "Kubernetes"],
        "hobbies": ["Mountaineering", "Backcountry Skiing", "Sustainable Cooking", "Botany"],
        "projects": ["Supply-chain carbon scope 3 calculation engine", "Open environmental emissions database"],
        "topics": ["High-precision emissions ledger architectures", "Glacier traverse safety in Mount Rainier", "Sourdough fermentation science"],
        "li_evidence": ["Scaling data pipeline from 10TB to 5PB with zero downtime", "Tech Women in Climate Leader 2024"],
        "ig_evidence": ["Summit photo atop Grand Teton in winter gear", "Home hydroponic herb garden setup"]
    },
    {
        "name": "Liam Gallagher",
        "headline": "Senior Security Researcher at Trail of Bits | Cryptography & Smart Contract Auditing",
        "linkedin_url": "https://www.linkedin.com/in/liam-gallagher-crypto",
        "instagram_url": "https://www.instagram.com/liam.keys.and.synth",
        "profile_image": "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=400&auto=format&fit=crop&q=80",
        "skills": ["Zero-Knowledge Proofs", "Formal Verification", "Rust", "EVM Security", "Reverse Engineering"],
        "hobbies": ["Synthesizers", "Modular Eurorack", "Darkroom Printing", "Urban Cycling"],
        "projects": ["Automated formal verification engine for ZK circuits", "Open audit disclosure for protocol vulnerabilities"],
        "topics": ["PLONK vs STARK proof generation tradeoffs", "Analog voltage controlled oscillators", "Fixed-gear bike build specs"],
        "li_evidence": ["Uncovered zero-day in elliptic curve implementation", "Defcon speaker on cryptography bugs"],
        "ig_evidence": ["Studio rack filled with Moog and Make Noise modules", "B&W silver gelatin print development in red room"]
    },
    {
        "name": "Maya Lin-Torres",
        "headline": "Lead Creative Technologist at Instrument | Interactive Installations & WebGL",
        "linkedin_url": "https://www.linkedin.com/in/maya-lin-torres",
        "instagram_url": "https://www.instagram.com/maya.visual.code",
        "profile_image": "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=400&auto=format&fit=crop&q=80",
        "skills": ["Three.js", "GLSL Shaders", "Creative Coding", "TouchDesigner", "TypeScript"],
        "hobbies": ["Generative Art", "DJing Ambient Techno", "Rock Climbing", "Tea Ceremonies"],
        "projects": ["Museum of Modern Art immersive spatial projection", "Open source Three.js fluid simulation library"],
        "topics": ["Real-time ray marching in WebGL shaders", "Ambient vinyl record mixing", "Gongfu tea brewing temps"],
        "li_evidence": ["FWA of the Day winner 2024 for interactive web experience", "Awwwards Annual Jury Member"],
        "ig_evidence": ["Video clip of sound-reactive generative visuals at private gallery", "Bouldering session at the gym"]
    },
    {
        "name": "Kaito Tanaka",
        "headline": "Founding Infrastructure Engineer at Cursor | Developer Tools & Editor Protocols",
        "linkedin_url": "https://www.linkedin.com/in/kaito-tanaka-devtools",
        "instagram_url": "https://www.instagram.com/kaito.tokyo.sf",
        "profile_image": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
        "skills": ["TypeScript", "Electron", "Language Server Protocol", "C++", "Fast Indexing"],
        "hobbies": ["Street Photography", "Matcha Brewing", "Vintage Mechanical Watches", "Archery (Kyudo)"],
        "projects": ["Semantic codebase indexing engine", "Low-latency streaming diff parser"],
        "topics": ["Semantic tree-sitter AST queries", "Ricoh GR III street compositions in Shinjuku", "Grand Seiko spring drive escapements"],
        "li_evidence": ["Architected code search indexing millions of repos under 50ms", "Tokyo University CS graduate"],
        "ig_evidence": ["Monochrome street snapshots of Tokyo rain", "Whisked ceremonial Uji matcha bowl at morning desk"]
    },
    {
        "name": "Zoe Kravitz-Smith",
        "headline": "Director of Product at Figma | Collaboration & AI Canvas Workflows",
        "linkedin_url": "https://www.linkedin.com/in/zoe-kravitz-product",
        "instagram_url": "https://www.instagram.com/zoe.plants.design",
        "profile_image": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=400&auto=format&fit=crop&q=80",
        "skills": ["Product Strategy", "User Research", "Collaborative Software", "AI UX", "Metrics & Retention"],
        "hobbies": ["Indoor Plant Propagating", "Pottery", "Pilates", "Modern Art Collecting"],
        "projects": ["Figma AI diagramming and intelligent layout feature suite", "Mentorship community for women in product"],
        "topics": ["Human-in-the-loop canvas UX", "Monsteras and rare variegated philodendrons", "Stoneware vs earthenware pottery firing"],
        "li_evidence": ["Led launch of FigJam AI features reached 5M active users in 6 months", "Ex-Dropbox Senior PM"],
        "ig_evidence": ["Living room jungle of 60+ thriving rare houseplants", "Hand-carved sgraffito ceramic mugs fresh from kiln"]
    },
    {
        "name": "David Alverez",
        "headline": "Bioinformatics Scientist at Genentech | Computational Genomics & AlphaFold",
        "linkedin_url": "https://www.linkedin.com/in/david-alvarez-bio",
        "instagram_url": "https://www.instagram.com/david.lab.and.trails",
        "profile_image": "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=400&auto=format&fit=crop&q=80",
        "skills": ["Computational Biology", "AlphaFold", "Python", "Nextflow", "Structural Biochemistry"],
        "hobbies": ["Ultra-endurance Gravel Biking", "Fermentation", "Bird Watching", "Acoustic Guitar"],
        "projects": ["Allosteric protein binding predictor using geometric deep learning", "Open microbial database"],
        "topics": ["Geometric graph neural networks for molecular docking", "100-mile gravel bike setup in Marin", "Wild yeast fermentation"],
        "li_evidence": ["Nature Biotechnology co-first author on targeted antibody design", "UC Berkeley PhD in Bioengineering"],
        "ig_evidence": ["Mud-splattered gravel bike against Golden Gate backdrop", "Homemade lacto-fermented hot sauces shelf"]
    },
    {
        "name": "Nadia O'Connor",
        "headline": "Head of Growth & Developer Relations at Supabase | Postgres & Open Source",
        "linkedin_url": "https://www.linkedin.com/in/nadia-oconnor-devrel",
        "instagram_url": "https://www.instagram.com/nadia.surf.and.tech",
        "profile_image": "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=400&auto=format&fit=crop&q=80",
        "skills": ["PostgreSQL", "Developer Experience", "Technical Writing", "Community Architecture", "TypeScript"],
        "hobbies": ["Longboard Surfing", "Cold Water Swimming", "Reading Essay Collections", "Film Festivals"],
        "projects": ["Supabase Launch Week community hackathons with 20k builders", "Interactive SQL tutorial platform"],
        "topics": ["Postgres Row Level Security strategies", "Pacifica surf conditions and wave swells", "Joan Didion and Annie Ernaux essays"],
        "li_evidence": ["Grew active developer community from 10k to 250k members", "Host of the Postgres Podcast"],
        "ig_evidence": ["Sunrise log session at Bolinas with 9'4 single fin", "Cozy bookstack and ocean coffee morning"]
    },
    {
        "name": "Tareq Mansour",
        "headline": "Co-Founder at Kalshi | Prediction Markets & Financial Engineering",
        "linkedin_url": "https://www.linkedin.com/in/tareq-mansour-markets",
        "instagram_url": "https://www.instagram.com/tareq.nyc.pulse",
        "profile_image": "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=400&auto=format&fit=crop&q=80",
        "skills": ["Quantitative Finance", "Exchange Architecture", "Market Microstructure", "Regulatory Tech", "Python"],
        "hobbies": ["Squash", "Architecture Walking Tours", "Espresso Tasting", "Historical Biographies"],
        "projects": ["CFTC-regulated binary prediction contract engine", "Order book matching engine handling sub-millisecond execution"],
        "topics": ["Information aggregation in event markets", "Squash court positioning strategy", "Post-modern NYC skyscraper design"],
        "li_evidence": ["Forbes 30 Under 30 in Finance", "MIT Electrical Engineering & Computer Science"],
        "ig_evidence": ["Squash tournament trophy celebration in Manhattan club", "Architecture book flatlay and espresso extraction"]
    },
    {
        "name": "Seraphina Wu",
        "headline": "Principal Quantum Software Architect at IBM Quantum | Qiskit Core Maintainer",
        "linkedin_url": "https://www.linkedin.com/in/seraphina-wu-quantum",
        "instagram_url": "https://www.instagram.com/seraphina.notes.tea",
        "profile_image": "https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?w=400&auto=format&fit=crop&q=80",
        "skills": ["Quantum Computing", "Qiskit", "Python", "Linear Algebra", "Error Mitigation Algorithms"],
        "hobbies": ["Classical Piano", "Chinese Tea Ceremony", "Ikebana Flower Arranging", "Museum Curation"],
        "projects": ["Quantum circuit transpiler pass for error suppression", "Open tutorial series on variational quantum eigensolvers"],
        "topics": ["Quantum fault tolerance thresholds", "Chopin Nocturnes interpretation", "Rare Wuyi Rock Oolong teas"],
        "li_evidence": ["Published research on 100+ qubit circuit synthesis", "Caltech Physics alumnus"],
        "ig_evidence": ["Steinway grand piano with sheet music in warm sunlight", "Elegantly arranged spring Ikebana floral centerpiece"]
    },
    {
        "name": "Oliver Sterling",
        "headline": "Staff Hardware Systems Engineer at Apple | Silicon Packaging & Thermal Design",
        "linkedin_url": "https://www.linkedin.com/in/oliver-sterling-hardware",
        "instagram_url": "https://www.instagram.com/oliver.craft.wood",
        "profile_image": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=400&auto=format&fit=crop&q=80",
        "skills": ["Hardware Architecture", "Thermal Dynamics", "Cadence", "SolidWorks", "Silicon Packaging"],
        "hobbies": ["Fine Woodworking", "Coffee Roasting", "Road Cycling", "Vintage Audio Equipment"],
        "projects": ["Advanced passive vapor chamber cooling system patent", "Custom hi-fi tube amplifier build"],
        "topics": ["Die-to-die interconnect thermal density", "Hand-planing Japanese white oak", "Vacuum tube bias calibration"],
        "li_evidence": ["Named inventor on 14 consumer device hardware patents", "Stanford Mechanical Engineering MS"],
        "ig_evidence": ["Handcrafted Japanese joinery coffee table progress", "Restored 1970s Marantz receiver glow in dark room"]
    },
    {
        "name": "Freja Lindqvist",
        "headline": "Lead Game Engine Developer at Embark Studios | Unreal Engine 5 & Procedural Worlds",
        "linkedin_url": "https://www.linkedin.com/in/freja-lindqvist-games",
        "instagram_url": "https://www.instagram.com/freja.nordic.wild",
        "profile_image": "https://images.unsplash.com/photo-1534751516642-a171d8820464?w=400&auto=format&fit=crop&q=80",
        "skills": ["C++", "Unreal Engine 5", "HLSL", "Procedural Generation", "Physics Engines"],
        "hobbies": ["Nordic Trekking", "Archery", "Woodcut Printmaking", "Scandinavian Folk Music"],
        "projects": ["Real-time voxel destruction physics solver", "Procedural biome generation framework"],
        "topics": ["Distance field representations for real-time physics", "Stockholm archipelago kayak route planning", "Linocut relief carving techniques"],
        "li_evidence": ["GDC 2024 speaker on scalable physics simulation", "10 years building AAA multiplayer engines"],
        "ig_evidence": ["Trek photos across Sarek National Park in northern Sweden", "Handmade woodblock prints hung to dry"]
    },
    {
        "name": "Arjun Mehra",
        "headline": "Staff Security Engineer at Cloudflare | Distributed DDoS Protection & eBPF",
        "linkedin_url": "https://www.linkedin.com/in/arjun-mehra-networks",
        "instagram_url": "https://www.instagram.com/arjun.runs.sf",
        "profile_image": "https://images.unsplash.com/photo-1508214751196-bcfd4ca60f91?w=400&auto=format&fit=crop&q=80",
        "skills": ["eBPF", "Linux Kernel", "BGP Routing", "Go", "C", "Network Security"],
        "hobbies": ["Marathon Running", "Chess", "Cooking Street Food", "Astronomy"],
        "projects": ["XDP packet filter capable of dropping 100M packets/sec per node", "eBPF tracing toolkit"],
        "topics": ["Kernel bypass networking with XDP", "Sub-3-hour marathon training splits", "Telescope astrophotography of Orion Nebula"],
        "li_evidence": ["Mitigated largest recorded Layer 7 DDoS attack", "Regular contributor to Linux kernel networking"],
        "ig_evidence": ["Early morning run across Golden Gate Bridge in thick fog", "Deep sky capture of Andromeda Galaxy through Celestron scope"]
    },
    {
        "name": "Camille Beaumont",
        "headline": "Head of Brand & Visual Systems at Vercel | Typography & Brand Identity",
        "linkedin_url": "https://www.linkedin.com/in/camille-beaumont-brand",
        "instagram_url": "https://www.instagram.com/camille.paris.studio",
        "profile_image": "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=400&auto=format&fit=crop&q=80",
        "skills": ["Brand Strategy", "Typography", "Art Direction", "Motion Design", "Visual Identity"],
        "hobbies": ["Antique Book Collecting", "Wine Tasting", "Ballet", "Museum Hopping"],
        "projects": ["Next.js global brand identity refresh", "Editorial typography specimen book"],
        "topics": ["Monospace type legibility in dark mode interfaces", "Bordeaux natural wines terroir", "Contemporary choreography"],
        "li_evidence": ["D&AD Pencil winner for digital design identity", "Speaker at Typographics NYC"],
        "ig_evidence": ["Rare 1920s Bauhaus typography book discovery in Paris", "Tasting lineup in Burgundy vineyard cellar"]
    },
    {
        "name": "Gabriel Santos",
        "headline": "Staff Autonomous Systems Engineer at Skydio | Computer Vision & State Estimation",
        "linkedin_url": "https://www.linkedin.com/in/gabriel-santos-vision",
        "instagram_url": "https://www.instagram.com/gabriel.ocean.surf",
        "profile_image": "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=400&auto=format&fit=crop&q=80",
        "skills": ["Computer Vision", "PyTorch", "SLAM", "C++", "Kalman Filters", "Embedded Linux"],
        "hobbies": ["Big Wave Surfing", "Brazilian Jiu-Jitsu", "Acoustic Bossa Nova", "Coffee Roasting"],
        "projects": ["360-degree obstacle avoidance neural network for micro-UAVs", "Open visual odometry benchmark"],
        "topics": ["Non-linear least squares optimization for bundle adjustment", "BJJ guard retention drills", "Antonio Carlos Jobim chord voicings"],
        "li_evidence": ["Lead author on IEEE Transactions on Robotics paper", "Former JPL Robotics intern"],
        "ig_evidence": ["Surfing sunset wave at Santa Cruz Steamer Lane", "Playing nylon string acoustic guitar on sunny porch"]
    },
    {
        "name": "Rin Takahashi",
        "headline": "Founding Audio Engineer at Suno AI | Generative Audio Models & DSP",
        "linkedin_url": "https://www.linkedin.com/in/rin-takahashi-audio",
        "instagram_url": "https://www.instagram.com/rin.soundscapes",
        "profile_image": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80",
        "skills": ["Digital Signal Processing", "Diffusion Models", "PyTorch", "Audio Synthesis", "C++"],
        "hobbies": ["Field Recording", "Ambient Music Composition", "Sake Tasting", "Hiking in Fog"],
        "projects": ["Latent diffusion generative audio decoder", "Hydrophone underwater sound library"],
        "topics": ["Neural vocoder phase reconstruction", "Binaural forest audio capture in Pacific Northwest", "Junmai Daiginjo flavor notes"],
        "li_evidence": ["Presented audio synthesis architecture at ISMIR 2024", "Tokyo National University of Fine Arts & Music alumni"],
        "ig_evidence": ["Field recording setup with parabolic microphone in foggy redwood forest", "Tape loop ambient performance"]
    },
    {
        "name": "Lucas Meyer",
        "headline": "Distinguished Privacy Engineer at DuckDuckGo | Zero-Knowledge Systems & Telemetry",
        "linkedin_url": "https://www.linkedin.com/in/lucas-meyer-privacy",
        "instagram_url": "https://www.instagram.com/lucas.cycling.trails",
        "profile_image": "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=80",
        "skills": ["Differential Privacy", "Applied Cryptography", "Rust", "Network Protocols", "Threat Modeling"],
        "hobbies": ["Bikepacking", "Brewing Kombucha", "Chess", "Film Noir Cinema"],
        "projects": ["Private aggregation telemetry system deployed across 50M devices", "Differential privacy audit toolkit"],
        "topics": ["Differential privacy epsilon guarantees in production", "Ultralight bikepacking gear lists", "Fritz Lang film analysis"],
        "li_evidence": ["Keynote on privacy-preserving metrics at USENIX Security", "EFF Pioneer Award nominee"],
        "ig_evidence": ["Loaded gravel bike camp setup under starry skies in Utah desert", "Kombucha fermentation glass jars"]
    },
    {
        "name": "Amira Al-Fassi",
        "headline": "Principal AI Alignment Researcher at OpenAI | Interpretability & Sparse Autoencoders",
        "linkedin_url": "https://www.linkedin.com/in/amira-al-fassi-alignment",
        "instagram_url": "https://www.instagram.com/amira.desert.stars",
        "profile_image": "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=400&auto=format&fit=crop&q=80",
        "skills": ["Mechanistic Interpretability", "Sparse Autoencoders", "PyTorch", "Transformers", "Linear Probing"],
        "hobbies": ["Astrophotography", "Middle Eastern Lute (Oud)", "Desert Trekking", "Calligraphy"],
        "projects": ["Feature extraction library discovering 1M interpretable directions in LLMs", "Open interpretability explorer"],
        "topics": ["Monosemantic feature dictionary learning", "Oud maqam modal theory", "Deep sky imaging of Milky Way core"],
        "li_evidence": ["Lead author on pioneering mechanistic interpretability paper with 1000+ citations", "Oxford Mathematical Physics PhD"],
        "ig_evidence": ["Long exposure tracker shot of stars over Joshua Tree boulders", "Intricate Arabic calligraphy scroll work"]
    },
    {
        "name": "Benji Campbell",
        "headline": "Lead Frontend Architect at Linear | Web Performance & Offline Architectures",
        "linkedin_url": "https://www.linkedin.com/in/benji-campbell-web",
        "instagram_url": "https://www.instagram.com/benji.coffeecraft",
        "profile_image": "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=400&auto=format&fit=crop&q=80",
        "skills": ["React", "TypeScript", "IndexedDB", "Web Workers", "Micro-Optimizations"],
        "hobbies": ["Pour-Over Coffee Geeking", "Road Biking", "Typography Design", "City Walking"],
        "projects": ["Instantaneous optimistic UI update engine for Linear", "Open source micro-benchmark suite for DOM layout"],
        "topics": ["Avoiding main-thread jank with Web Workers", "Aeropress inverted competition recipes", "Swiss modernist grid systems"],
        "li_evidence": ["Reduced initial load time by 65% for heavy workspace accounts", "Speaker at React Summit"],
        "ig_evidence": ["Refractometer readings of 22% coffee extraction yields", "Morning century bike ride through Marin Headlands"]
    },
    {
        "name": "Talia Rosenberg",
        "headline": "Co-Founder & CTO at Opal Health | AI Diagnostics & HIPAA Compliant Infra",
        "linkedin_url": "https://www.linkedin.com/in/talia-rosenberg-health",
        "instagram_url": "https://www.instagram.com/talia.trail.climbs",
        "profile_image": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&auto=format&fit=crop&q=80",
        "skills": ["Medical Imaging AI", "HIPAA Architecture", "Federated Learning", "Python", "Kubernetes"],
        "hobbies": ["Rock Climbing", "Sourdough Baking", "Trail Running", "Classical Cello"],
        "projects": ["FDA-cleared computer vision diagnostic assistant", "Zero-leakage federated learning medical consortium"],
        "topics": ["Federated learning differential privacy in hospital data", "Cello suites of J.S. Bach", "100% hydration sourdough crumb structure"],
        "li_evidence": ["Forbes 30 Under 30 Healthcare", "MIT CSAIL alumna and published researcher"],
        "ig_evidence": ["Multi-pitch climbing route at Yosemite on El Capitan base", "Golden crust sourdough loaf cross-section"]
    },
    {
        "name": "Ethan Cross",
        "headline": "Founding Developer Advocate at Resend | Email Infra & Next.js React Email",
        "linkedin_url": "https://www.linkedin.com/in/ethan-cross-dx",
        "instagram_url": "https://www.instagram.com/ethan.lens.light",
        "profile_image": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&auto=format&fit=crop&q=80",
        "skills": ["Next.js", "React Email", "Tailwind CSS", "TypeScript", "Developer Experience"],
        "hobbies": ["Street Photography", "Mechanical Keyboards", "Running", "Indie Game Development"],
        "projects": ["React Email core component library with 1M+ weekly downloads", "Pixel art puzzle game on Steam"],
        "topics": ["HTML email rendering quirks across Outlook and Gmail", "Lubricating custom tactile keyboard switches", "5k tempo run workouts"],
        "li_evidence": ["Scaled developer documentation and open source tutorials to 500k monthly readers", "Ex-Vercel developer educator"],
        "ig_evidence": ["Nighttime neon street photos in Tokyo and San Francisco", "Custom solderless keyboard build with brass weight"]
    }
]

def seed_database(db):
    """Populates database with 25 people, analyzed profiles, agents, dating sessions, and rankings."""
    from backend.models import Person, Profile, Agent, DateSession, Ranking
    from backend.services.ranking import compute_profile_vector, generate_personalized_rankings_for_person
    from backend.services.dating import analyze_completed_date

    # Clear existing data for idempotent seeding
    db.query(Ranking).delete()
    db.query(DateSession).delete()
    db.query(Agent).delete()
    db.query(Profile).delete()
    db.query(Person).delete()
    db.commit()

    created_people = []

    for person_dict in SEED_PEOPLE:
        p = Person(
            name=person_dict["name"],
            headline=person_dict["headline"],
            linkedin_url=person_dict["linkedin_url"],
            instagram_url=person_dict["instagram_url"],
            profile_image=person_dict["profile_image"],
            status="verified",
            linkedin_content={
                "title": person_dict["headline"],
                "evidence": person_dict["li_evidence"],
                "source_url": person_dict["linkedin_url"]
            },
            instagram_content={
                "title": f"@{person_dict['instagram_url'].split('/')[-1]} public creator",
                "evidence": person_dict["ig_evidence"],
                "source_url": person_dict["instagram_url"]
            }
        )
        db.add(p)
        db.flush()

        profile_data = {
            "identity": {
                "name": person_dict["name"],
                "headline": person_dict["headline"],
                "location": "San Francisco Bay Area",
                "current_role": person_dict["headline"].split(" at ")[0] if " at " in person_dict["headline"] else "Specialist",
                "attribution": "LinkedIn"
            },
            "professional_interests": {
                "technical_topics": person_dict["skills"][:3],
                "skills": person_dict["skills"],
                "attribution": "LinkedIn"
            },
            "hobbies": {
                "activities": person_dict["hobbies"],
                "creative_passions": person_dict["hobbies"][:2],
                "attribution": "Instagram"
            },
            "projects": {
                "public_work": person_dict["projects"],
                "attribution": "LinkedIn"
            },
            "topics": person_dict["topics"],
            "skills": person_dict["skills"],
            "explicit_preferences": {
                "stated_preferences": []
            },
            "signals": {
                "professional_signals": [f"Deep focus in {person_dict['skills'][0]}"],
                "interest_signals": [f"Active commitment to {person_dict['hobbies'][0]}"],
                "activity_signals": ["Publicly verified technical contributions and creative projects"]
            },
            "evidence": {
                "linkedin_evidence": person_dict["li_evidence"],
                "instagram_evidence": person_dict["ig_evidence"]
            }
        }

        vector = compute_profile_vector(profile_data)

        prof = Profile(
            person_id=p.id,
            identity=profile_data["identity"],
            professional_interests=profile_data["professional_interests"],
            hobbies=profile_data["hobbies"],
            projects=profile_data["projects"],
            topics=profile_data["topics"],
            skills=profile_data["skills"],
            explicit_preferences=profile_data["explicit_preferences"],
            signals=profile_data["signals"],
            evidence=profile_data["evidence"],
            embedding=vector
        )
        db.add(prof)

        system_prompt = (
            f"You represent {p.name}. You are grounded in their verified LinkedIn & Instagram background: "
            f"Skills: {', '.join(person_dict['skills'])}; Hobbies: {', '.join(person_dict['hobbies'])}; "
            f"Projects: {', '.join(person_dict['projects'])}. Never fabricate private facts or sensitive traits."
        )
        agent = Agent(
            person_id=p.id,
            system_prompt=system_prompt,
            memory={"profile_summary": person_dict["headline"]},
            status="active"
        )
        db.add(agent)
        created_people.append(p)

    db.commit()

    # Precompute dating sessions between realistic pairs
    sample_pairs = [
        (0, 1), # Elena & Marcus (AI Alignment & Rust Local-First)
        (2, 8), # Aria & Kaito (Principal Designer & Cursor Founding Engineer)
        (0, 4), # Elena & Siddharth (AI Alignment & ML Infra)
        (3, 18), # Julian & Gabriel (Robotics & Autonomous Systems)
        (5, 10), # Chloe & David (Climate Tech & Bioinformatics)
        (7, 19), # Maya & Rin (Creative Technologist & Audio Engineer)
        (1, 22), # Marcus & Benji (Systems Architect & Frontend Architect at Linear)
        (9, 2),  # Zoe & Aria (Figma Product & Stripe Design)
    ]

    for idx_a, idx_b in sample_pairs:
        p_a = created_people[idx_a]
        p_b = created_people[idx_b]
        
        prof_a = p_a.profile
        prof_b = p_b.profile
        
        # Build 8 realistic, fully grounded dialogue turns
        skills_a = prof_a.skills or []
        skills_b = prof_b.skills or []
        hobbies_a = prof_a.hobbies.get("activities", [])
        hobbies_b = prof_b.hobbies.get("activities", [])
        
        messages = [
            {
                "turn": 1,
                "sender_id": p_a.agent.id,
                "sender_name": p_a.name,
                "sender_avatar": p_a.profile_image,
                "recipient_name": p_b.name,
                "message": f"Hi {p_b.name}! Great to meet you. I was reading about your work in {skills_b[0] if skills_b else 'technology'}, and outside of building systems I noticed you spend time with {hobbies_b[0] if hobbies_b else 'creative activities'}. How has your work week been?",
                "phase": "opener",
                "timestamp": "19:00:15",
                "evidence_grounding": [skills_b[0] if skills_b else "Tech", hobbies_b[0] if hobbies_b else "Hobbies"]
            },
            {
                "turn": 2,
                "sender_id": p_b.agent.id,
                "sender_name": p_b.name,
                "sender_avatar": p_b.profile_image,
                "recipient_name": p_a.name,
                "message": f"Hey {p_a.name}! Wonderful to connect. It's been a busy stretch—we've been heads down pushing progress on {skills_b[0] if skills_b else 'our core engine'}. And yes, {hobbies_b[0] if hobbies_b else 'downtime'} has been my essential reset. How do you recharge after deep focus sessions?",
                "phase": "response_bridge",
                "timestamp": "19:01:02",
                "evidence_grounding": [skills_b[0] if skills_b else "Focus", hobbies_b[0] if hobbies_b else "Downtime"]
            },
            {
                "turn": 3,
                "sender_id": p_a.agent.id,
                "sender_name": p_a.name,
                "sender_avatar": p_a.profile_image,
                "recipient_name": p_b.name,
                "message": f"For me, getting out into {hobbies_a[0] if hobbies_a else 'nature'} provides total mental clearance. When you're dealing with complex problems like {skills_a[0] if skills_a else 'distributed logic'}, stepping away into physical endurance brings clarity back.",
                "phase": "inquire_passion",
                "timestamp": "19:02:18",
                "evidence_grounding": [hobbies_a[0] if hobbies_a else "Activity", skills_a[0] if skills_a else "Engineering"]
            },
            {
                "turn": 4,
                "sender_id": p_b.agent.id,
                "sender_name": p_b.name,
                "sender_avatar": p_b.profile_image,
                "recipient_name": p_a.name,
                "message": f"I completely relate. There's a tangible tactile feedback loop in both {hobbies_b[0] if hobbies_b else 'creative hobbies'} and writing solid code. You know immediately whether the balance holds or needs re-tuning.",
                "phase": "deep_dive",
                "timestamp": "19:03:40",
                "evidence_grounding": [hobbies_b[0] if hobbies_b else "Craft"]
            },
            {
                "turn": 5,
                "sender_id": p_a.agent.id,
                "sender_name": p_a.name,
                "sender_avatar": p_a.profile_image,
                "recipient_name": p_b.name,
                "message": f"Exactly! It's so rare to speak with someone who values craft and rigorous execution at the same level. Our mutual respect for {skills_a[1] if len(skills_a) > 1 else 'systems design'} feels very natural.",
                "phase": "shared_discovery",
                "timestamp": "19:04:55",
                "evidence_grounding": ["Engineering Rigor", "Craftsmanship"]
            },
            {
                "turn": 6,
                "sender_id": p_b.agent.id,
                "sender_name": p_b.name,
                "sender_avatar": p_b.profile_image,
                "recipient_name": p_a.name,
                "message": f"What I find especially exciting is how your expertise in {skills_a[0] if skills_a else 'research'} complements my background in {skills_b[0] if skills_b else 'architecture'}. Exploring problems from both empirical and systems viewpoints is where the magic happens.",
                "phase": "complementary",
                "timestamp": "19:06:12",
                "evidence_grounding": [skills_a[0] if skills_a else "Research", skills_b[0] if skills_b else "Systems"]
            },
            {
                "turn": 7,
                "sender_id": p_a.agent.id,
                "sender_name": p_a.name,
                "sender_avatar": p_a.profile_image,
                "recipient_name": p_b.name,
                "message": f"True! We do approach day-to-day workflow differently—I tend to live in theoretical proofs and models, while you are deeply hands-on with low-level implementation. That contrast actually keeps conversations invigorating.",
                "phase": "explore_contrast",
                "timestamp": "19:07:30",
                "evidence_grounding": ["Workflow Balance", "Contrasting Perspectives"]
            },
            {
                "turn": 8,
                "sender_id": p_b.agent.id,
                "sender_name": p_b.name,
                "sender_avatar": p_b.profile_image,
                "recipient_name": p_a.name,
                "message": f"Agreed! I really enjoyed our conversation, {p_a.name}. It was thoughtful, genuine, and grounded in who we are. Looking forward to keeping this connection alive!",
                "phase": "conclusion",
                "timestamp": "19:08:45",
                "evidence_grounding": ["Connection Wrap-up"]
            }
        ]

        analysis = analyze_completed_date(
            profile_a={"skills": skills_a, "hobbies": {"activities": hobbies_a}},
            profile_b={"skills": skills_b, "hobbies": {"activities": hobbies_b}},
            person_a_name=p_a.name,
            person_b_name=p_b.name,
            messages=messages
        )

        date_session = DateSession(
            agent_a_id=p_a.agent.id,
            agent_b_id=p_b.agent.id,
            status="completed",
            messages=messages,
            shared_interests=analysis["shared_interests"],
            complementary_interests=analysis["complementary_interests"],
            differences=analysis["differences"],
            evidence=analysis["evidence"],
            assessment=analysis["assessment"],
            confidence=analysis["confidence"],
            compatibility_score=analysis["compatibility_score"],
            current_turn=8,
            max_turns=8
        )
        db.add(date_session)

    db.commit()

    # Generate personalized rankings for all 25 people
    for p in created_people:
        generate_personalized_rankings_for_person(db, p, created_people)

    return len(created_people)
