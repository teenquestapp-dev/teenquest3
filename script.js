// Supabase configuration - REPLACE WITH YOUR ACTUAL CREDENTIALS
const SUPABASE_URL = 'https://yqjfzwprpyiimolxkgvy.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_I0m8GKe5acKOrK14lFY80g_8ylJmaRy';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';

class AcademicAnxietyApp {
    constructor() {
        this.supabase = null;
        this.user = null;
        this.participantId = null;
        this.statisticsType = 'comprehensive_stats';
        this.sessionStartTime = null;
        this.currentSection = 'home';
        this.userTracking = {};
        this.sectionStartTime = null;
        this.sessionId = null;
        this.currentDocument = null;
        
        // PDF viewer state
        this.pdfDoc = null;
        this.pageNum = 1;
        this.pageRendering = false;
        this.pageNumPending = null;
        this.pdfUrl = null;
        
        // Audio player state
        this.audioPlayer = null;
        this.currentAudio = null;
        this.isPlaying = false;
        this.audioFiles = {
            'strategies': [
                { id: 'anxiety-narrative', title: 'Rewriting the Narrative of Academic Anxiety', file: 'anxiety-narrative.mp3', duration: '5:30' }
            ],
            'study': [
                { id: 'study-habits', title: 'Effective Study Habits Guide', file: 'study-habits.mp3', duration: '7:15' }
            ],
            'breathing': [
                { id: 'breathing-exercises', title: 'Guided Deep Breathing Exercises', file: 'breathing-exercises.mp3', duration: '10:20' }
            ],
            'exercise': [
                { id: 'physical-exercises', title: 'Guided Physical Exercises', file: 'physical-exercises.mp3', duration: '8:45' }
            ],
            'meditation': [
                { id: 'meditation-guide', title: 'Guided Meditation Practices', file: 'meditation-guide.mp3', duration: '12:10' }
            ]
        };

        // Research team data
        this.researchTeam = {
            heads: [
                {
                    name: "Dr. Prof.(Dr)Helen Shaji J.C.",
                    role: "DEAN ,  College of Nursing <p>SRM College of Nursing, Medicine & Health Sciences, Kattankulathur - Chennai 603203 </p>                                                      ",
                    image: "assets/team/Dr. Helen Shaji J C.png",
                    description: "Dr. Johnson specializes in adolescent mental health and has over 15 years of experience in clinical psychology. She leads the research team with expertise in anxiety disorders and cognitive-behavioral interventions.",
                    qualifications: "PhD in Medical Surgical Nursing "
                },
                {
                    name: "Prof.(Dr)Dr.R.Vijayalakshmi",
                    role: "VICE PRINCIPAL , College of Nursing <p>SRM College of Nursing, Medicine & Health Sciences, Kattankulathur - Chennai 603203 </p> ",
                    image: "assets/team/Dr.R.Vijayalakshmi.jpg",
                    description: "Dr. Chen focuses on educational psychology and learning methodologies. His research explores the intersection of academic performance and mental wellbeing in teenage students.",
                    qualifications: "PhD in Psychiatric Nursing"
                }
            ],
            students: [
                {
                    name: "Mr.Alanjino",
                    role: "Student Researcher <p> BSc(N) 4th Year </p>",
                    image: "assets/team/mr.alanjino.jpg",
                    description: "Psychology major with focus on adolescent development. Emily coordinates participant recruitment and data collection.",
                    year: "4th Year"
                },
                {
                    name: "Mr.Jove singh",
                    role: "Student Researcher <p> BSc(N) 4th Year </p>",
                    image: "assets/team/mr.jove singh.jpg",
                    description: "Statistics and Psychology double major. James handles quantitative analysis and statistical modeling for the research data.",
                    year: "4th Year"
                },
                {
                    name: "Mr.shane sujeeth",
                    role: "Student Researcher <p> BSc(N) 4th Year </p>",
                    image: "assets/team/mr.shane sujeeth.jpg",
                    description: "Education and Digital Media major. Sophia develops the therapeutic content and ensures it's age-appropriate and engaging.",
                    year: "4th Year"
                },
                {
                    name: "Mr.Shebin Ahmad",
                    role: "Student Researcher <p> BSc(N) 4th Year </p>",
                    image: "assets/team/mr.shebin Ahmad.jpg",
                    description: "Computer Science and Psychology major. Daniel oversees the technical implementation and platform development.",
                    year: "4th Year"
                },
                {
                    name: "Mr.Shri balaji",
                    role: "Student Researcher <p> BSc(N) 4th Year </p>",
                    image: "assets/team/mr.shri balaji.jpg",
                    description: "Human-Computer Interaction major. Olivia conducts usability testing and gathers user feedback to improve the platform.",
                    year: "4th Year"
                },
                {
                    name: "Ms.Aswini",
                    role: "Student Researcher <p> BSc(N) 4th Year </p>",
                    image: "assets/team/ms.aswini.jpg",
                    description: "Communications and Psychology major. Ethan manages community outreach and participant communication.",
                    year: "4th Year"
                },
                {
                    name: "Ms.Ilayabharathi",
                    role: "Student Researcher <p> BSc(N) 4th Year </p>",
                    image: "assets/team/ms.ilayabharathi.jpg",
                    description: "Psychology and Literature major. Ava conducts literature reviews and ensures evidence-based content development.",
                    year: "4th Year"
                },
                {
                    name: "Ms.Pritha halder",
                    role: "Student Researcher <p> BSc(N) 4th Year </p>",
                    image: "assets/team/ms.pritha halder.jpg",
                    description: "Music Therapy and Psychology major. Noah produces and records the guided audio content for the platform.",
                    year: "4th Year"
                },
                {
                    name: "Ms.Vijayalakshmi",
                    role: "Student Researcher <p> BSc(N) 4th Year </p>",
                    image: "assets/team/ms.vijayalakshmi.jpg",
                    description: "Bioethics and Psychology major. Isabella ensures all research protocols meet ethical standards and guidelines.",
                    year: "4th Year"
                },
                {
                    name: "Mr.Mathews regi",
                    role: "Student Researcher <p> BSc(N) 4th Year </p>",
                    image: "assets/team/mr.mathews regi.jpg",
                    description: "Cybersecurity and Psychology major. Liam manages data security and ensures participant privacy protection.",
                    year: "4th Year"
                }
            ]
        };
        
        this.init();
    }

    async init() {
        await this.initializeSupabase();
        this.setupEventListeners();
        this.checkAuthState();
        
        // Listen for auth state changes (email confirmation)
        this.supabase.auth.onAuthStateChange((event, session) => {
            console.log('Auth state changed:', event, session);
            if (event === 'SIGNED_IN' && session) {
                console.log('User signed in after email confirmation');
                this.handleUserSession(session.user);
            }
        });
    }

    async initializeSupabase() {
        try {
            this.supabase = supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
            console.log('Supabase initialized successfully');
        } catch (error) {
            console.error('Error initializing Supabase:', error);
        }
    }

    setupEventListeners() {
        // Auth modal toggles
        const showRegister = document.getElementById('showRegister');
        const showLogin = document.getElementById('showLogin');
        
        if (showRegister) showRegister.addEventListener('click', () => {
            this.showModal('registerModal');
        });

        if (showLogin) showLogin.addEventListener('click', () => {
            this.showModal('loginModal');
        });

        // Auth forms
        const loginForm = document.getElementById('loginForm');
        const registerForm = document.getElementById('registerForm');
        
        if (loginForm) loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleLogin();
        });

        if (registerForm) registerForm.addEventListener('submit', (e) => {
            e.preventDefault();
            this.handleRegister();
        });

        // Logout
        const logoutBtn = document.getElementById('logoutBtn');
        if (logoutBtn) logoutBtn.addEventListener('click', () => {
            this.handleLogout();
        });

        // Navigation
        document.querySelectorAll('.nav-item').forEach(item => {
            item.addEventListener('click', (e) => {
                const section = e.currentTarget.dataset.section;
                this.showSection(section);
                this.trackVisit(section);
                this.closeMobileMenu();
            });
        });

        // Mobile menu toggle
        const menuToggle = document.getElementById('menuToggle');
        if (menuToggle) menuToggle.addEventListener('click', () => {
            this.toggleMobileMenu();
        });

        // Sidebar close button
        const sidebarClose = document.getElementById('sidebarClose');
        if (sidebarClose) sidebarClose.addEventListener('click', () => {
            this.closeMobileMenu();
        });

        // Sidebar overlay
        const sidebarOverlay = document.getElementById('sidebarOverlay');
        if (sidebarOverlay) sidebarOverlay.addEventListener('click', () => {
            this.closeMobileMenu();
        });

        // Document modal
        const closeDocument = document.getElementById('closeDocument');
        const closeDocumentBtn = document.getElementById('closeDocumentBtn');
        const downloadDocument = document.getElementById('downloadDocument');
        
        if (closeDocument) closeDocument.addEventListener('click', () => {
            this.hideDocumentModal();
        });
        
        if (closeDocumentBtn) closeDocumentBtn.addEventListener('click', () => {
            this.hideDocumentModal();
        });
        
        if (downloadDocument) downloadDocument.addEventListener('click', () => {
            this.downloadCurrentDocument();
        });

        // PDF modal
        const closePdf = document.getElementById('closePdf');
        const prevPage = document.getElementById('prevPage');
        const nextPage = document.getElementById('nextPage');
        const downloadPdf = document.getElementById('downloadPdf');
        
        if (closePdf) closePdf.addEventListener('click', () => {
            this.hidePdfModal();
        });
        
        if (prevPage) prevPage.addEventListener('click', () => {
            this.onPrevPage();
        });
        
        if (nextPage) nextPage.addEventListener('click', () => {
            this.onNextPage();
        });
        
        if (downloadPdf) downloadPdf.addEventListener('click', () => {
            this.downloadPdf();
        });

        // Audio modal
        const closeAudio = document.getElementById('closeAudio');
        const closeAudioBtn = document.getElementById('closeAudioBtn');
        const playPauseBtn = document.getElementById('playPauseBtn');
        const muteBtn = document.getElementById('muteBtn');
        const progressBar = document.getElementById('progressBar');
        
        if (closeAudio) closeAudio.addEventListener('click', () => {
            this.hideAudioModal();
        });
        
        if (closeAudioBtn) closeAudioBtn.addEventListener('click', () => {
            this.hideAudioModal();
        });
        
        if (playPauseBtn) playPauseBtn.addEventListener('click', () => {
            this.togglePlayPause();
        });
        
        if (muteBtn) muteBtn.addEventListener('click', () => {
            this.toggleMute();
        });
        
        if (progressBar) progressBar.addEventListener('click', (e) => {
            this.setProgress(e);
        });  
    }
    

    toggleMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.toggle('active');
            overlay.classList.toggle('active');
            
            // Prevent body scroll when menu is open
            if (sidebar.classList.contains('active')) {
                document.body.style.overflow = 'hidden';
            } else {
                document.body.style.overflow = '';
            }
        }
    }

    closeMobileMenu() {
        const sidebar = document.getElementById('sidebar');
        const overlay = document.getElementById('sidebarOverlay');
        
        if (sidebar && overlay) {
            sidebar.classList.remove('active');
            overlay.classList.remove('active');
            document.body.style.overflow = '';
        }
    }

    async checkAuthState() {
        try {
            if (!this.supabase) {
                console.error('Supabase not initialized');
                this.showModal('loginModal');
                return;
            }

            const { data: { session }, error } = await this.supabase.auth.getSession();
            
            if (error) {
                console.error('Error checking auth state:', error);
                this.showModal('loginModal');
                return;
            }

            if (session?.user) {
                console.log('User found in session:', session.user.email);
                await this.handleUserSession(session.user);
            } else {
                console.log('No user session found');
                this.showModal('loginModal');
            }
        } catch (error) {
            console.error('Auth check error:', error);
            this.showModal('loginModal');
        }
    }
    async viewAllUserData() {
    if (!this.user) return;
    
    try {
        console.log('=== USER DATA ANALYSIS ===');
        
        // Get all user data
        const { data: profiles, error: profileError } = await this.supabase
            .from('user_profiles')
            .select('*')
            .eq('id', this.user.id);
        
        const { data: sessions, error: sessionError } = await this.supabase
            .from('user_sessions')
            .select('*')
            .eq('user_id', this.user.id);
        
        const { data: sections, error: sectionError } = await this.supabase
            .from('section_visits')
            .select('*')
            .eq('user_id', this.user.id);
        
        const { data: feedback, error: feedbackError } = await this.supabase
            .from('user_feedback')
            .select('*')
            .eq('user_id', this.user.id);
        
        const { data: documents, error: docError } = await this.supabase
            .from('document_interactions')
            .select('*')
            .eq('user_id', this.user.id);
        
        const { data: audio, error: audioError } = await this.supabase
            .from('audio_interactions')
            .select('*')
            .eq('user_id', this.user.id);
        
        const { data: daily, error: dailyError } = await this.supabase
            .from('daily_usage_summary')
            .select('*')
            .eq('user_id', this.user.id);
        
        console.log('User Profile:', profiles);
        console.log('Sessions:', sessions);
        console.log('Section Visits:', sections);
        console.log('Feedback:', feedback);
        console.log('Document Interactions:', documents);
        console.log('Audio Interactions:', audio);
        console.log('Daily Usage:', daily);
        
    } catch (error) {
        console.error('Error viewing user data:', error);
    }
}

   async handleUserSession(user) {
    console.log('Handling user session for:', user.email);
    this.user = user;
    
    try {
        // Set participant ID from user metadata first
        this.participantId = user.user_metadata?.participant_id || 'DEMO_' + user.id.substring(0, 8);
        
        // Create or update user profile in the database
        const { data: profile, error: profileError } = await this.supabase
            .from('user_profiles')
            .upsert([{
                id: user.id,
                email: user.email,
                full_name: user.user_metadata?.full_name || 'Unknown',
                participant_id: this.participantId,
                updated_at: new Date().toISOString()
            }], {
                onConflict: 'id'
            });

        if (profileError) {
            console.error('Error creating/updating user profile:', profileError);
            // Continue even if profile creation fails
        } else {
            console.log('User profile created/updated successfully');
        }

        // Update UI with user name
        document.getElementById('userName').textContent = user.user_metadata?.full_name || user.email;
        
        // Clear any pending registration data
        this.clearPendingRegistration();
        
        // Load user tracking data
        await this.loadUserTracking();
        
        // Update UI
        this.updateUIForAuthState(true);
        
        // Start session
        this.sessionStartTime = new Date();
        await this.logSessionStart();
        
        // Always show home section after login
        this.showSection('home');
        this.trackVisit('home');

        console.log('User session setup complete');
    } catch (error) {
        console.error('Error handling user session:', error);
    }
}

    // Store registration data temporarily
    storePendingRegistration(data) {
        localStorage.setItem('pendingRegistration', JSON.stringify(data));
    }

    getPendingRegistration() {
        const data = localStorage.getItem('pendingRegistration');
        return data ? JSON.parse(data) : null;
    }

    clearPendingRegistration() {
        localStorage.removeItem('pendingRegistration');
    }

    async completeUserRegistration(user, registrationData) {
    try {
        // Create user profile with the stored registration data
        const { error: profileError } = await this.supabase
            .from('user_profiles')
            .upsert([{
                id: user.id,
                email: user.email,
                full_name: registrationData.name,
                participant_id: registrationData.participantId,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
            }], {
                onConflict: 'id'
            });

        if (profileError) {
            console.error('Error creating profile after confirmation:', profileError);
            // Use demo data as fallback
            this.participantId = 'DEMO_' + user.id.substring(0, 8);
            document.getElementById('userName').textContent = user.email;
        } else {
            console.log('Profile created successfully after email confirmation');
            this.participantId = registrationData.participantId;
            document.getElementById('userName').textContent = registrationData.name;
            
            // Clear the pending registration data
            this.clearPendingRegistration();
            
            // Show welcome message
            this.showWelcomeMessage(registrationData.name);
        }
    } catch (error) {
        console.error('Error completing registration:', error);
    }
}
    showWelcomeMessage(name) {
        // You can show a custom welcome message here
        console.log(`Welcome ${name}! Your registration is now complete.`);
    }

    async handleLogin() {
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        if (!email || !password) {
            alert('Please enter both email and password');
            return;
        }

        try {
            const { data, error } = await this.supabase.auth.signInWithPassword({
                email: email,
                password: password
            });

            if (error) {
                if (error.message.includes('Email not confirmed')) {
                    alert('Please check your email and confirm your account before logging in.');
                } else {
                    alert('Login failed: ' + error.message);
                }
                return;
            }

            console.log('Login successful for:', data.user.email);
            await this.handleUserSession(data.user);
            this.hideModals();
        } catch (error) {
            console.error('Login error:', error);
            alert('Login error: ' + error.message);
        }
    }

    async handleRegister() {
        const name = document.getElementById('registerName').value;
        const email = document.getElementById('registerEmail').value;
        const password = document.getElementById('registerPassword').value;
        const participantId = document.getElementById('registerParticipantId').value;
        const consent = document.getElementById('consentCheckbox').checked;

        if (!name || !email || !password || !participantId) {
            alert('Please fill in all required fields');
            return;
        }

        if (!consent) {
            alert('Please consent to participate in the research study');
            return;
        }

        try {
            // Store registration data temporarily
            const registrationData = {
                name: name,
                email: email,
                participantId: participantId
            };
            this.storePendingRegistration(registrationData);

            // Register the user - this will send confirmation email
            const { data: authData, error: authError } = await this.supabase.auth.signUp({
                email: email,
                password: password,
                options: {
                    data: {
                        full_name: name,
                        participant_id: participantId
                    }
                }
            });

            if (authError) {
                // Clear pending registration on error
                this.clearPendingRegistration();
                alert('Registration failed: ' + authError.message);
                return;
            }

            console.log('Auth registration successful, confirmation email sent');

            // Show success message with email confirmation instructions
            this.showRegistrationSuccess(email);
            
            // Reset form
            document.getElementById('registerForm').reset();
            
        } catch (error) {
            // Clear pending registration on error
            this.clearPendingRegistration();
            console.error('Registration error:', error);
            alert('Registration error: ' + error.message);
        }
    }

    showRegistrationSuccess(email) {
        // Hide the register modal
        this.hideModals();
        
        // Show success message in login modal
        const loginModal = document.getElementById('loginModal');
        const loginBody = loginModal.querySelector('.modal-body');
        
        // Create success message
        const successHTML = `
            <div style="text-align: center; padding: 2rem;">
                <div style="font-size: 3rem; color: #4CAF50; margin-bottom: 1rem;">
                    <i class="fas fa-envelope"></i>
                </div>
                <h3 style="color: #333; margin-bottom: 1rem;">Check Your Email!</h3>
                <p style="color: #666; margin-bottom: 1.5rem;">
                    We've sent a confirmation email to <strong>${email}</strong>. 
                    Please check your inbox and click the confirmation link to activate your account.
                </p>
                <div style="background: #e8f5e8; padding: 1rem; border-radius: 8px; margin-bottom: 1.5rem;">
                    <p style="color: #2e7d32; margin: 0; font-size: 0.9rem;">
                        <i class="fas fa-lightbulb"></i> 
                        <strong>Tip:</strong> Check your spam folder if you don't see the email within a few minutes.
                    </p>
                </div>
                <button class="btn btn-primary" id="returnToLoginBtn">
                    Return to Login
                </button>
            </div>
        `;
        
        // Store original content and replace with success message
        if (!loginModal.originalContent) {
            loginModal.originalContent = loginBody.innerHTML;
        }
        loginBody.innerHTML = successHTML;
        
        // Add event listener to the return button
        setTimeout(() => {
            const returnBtn = document.getElementById('returnToLoginBtn');
            if (returnBtn) {
                returnBtn.addEventListener('click', () => {
                    this.restoreLoginModal();
                });
            }
        }, 100);
        
        // Show the login modal with success message
        this.showModal('loginModal');
    }

    restoreLoginModal() {
        const loginModal = document.getElementById('loginModal');
        const loginBody = loginModal.querySelector('.modal-body');
        
        if (loginModal.originalContent) {
            loginBody.innerHTML = loginModal.originalContent;
            delete loginModal.originalContent;
            
            // Re-attach event listeners to the restored form
            const loginForm = document.getElementById('loginForm');
            if (loginForm) {
                loginForm.addEventListener('submit', (e) => {
                    e.preventDefault();
                    this.handleLogin();
                });
            }
        }
        
        // Hide the modal after restoring content
        this.hideModals();
    }

    async handleLogout() {
        try {
            // Save session data before logout
            await this.logSessionEnd();
            
            const { error } = await this.supabase.auth.signOut();
            if (error) {
                console.error('Logout error:', error);
            }

            this.user = null;
            this.participantId = null;
            this.userTracking = {};
            this.updateUIForAuthState(false);
            
            // Restore original login modal content
            this.restoreLoginModal();
            this.showModal('loginModal');
            
            this.clearMainContent();
            
            console.log('Logout successful');
        } catch (error) {
            console.error('Logout error:', error);
        }
    }

    updateUIForAuthState(isAuthenticated) {
        const userInfo = document.getElementById('userInfo');
        const sidebar = document.getElementById('sidebar');
        
        if (isAuthenticated) {
            if (userInfo) userInfo.style.display = 'flex';
            if (sidebar) sidebar.style.display = 'block';
        } else {
            if (userInfo) userInfo.style.display = 'none';
            if (sidebar) sidebar.style.display = 'none';
        }
    }

    showModal(modalId) {
        this.hideModals();
        const modal = document.getElementById(modalId);
        if (modal) modal.style.display = 'flex';
    }

    hideModals() {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.style.display = 'none';
        });
    }

    showDocumentModal() {
        this.hideModals();
        const modal = document.getElementById('documentModal');
        if (modal) modal.style.display = 'flex';
    }

    hideDocumentModal() {
        const modal = document.getElementById('documentModal');
        if (modal) modal.style.display = 'none';
        this.currentDocument = null;
    }

    showPdfModal() {
        this.hideModals();
        const modal = document.getElementById('pdfModal');
        if (modal) modal.style.display = 'flex';
    }

    hidePdfModal() {
        const modal = document.getElementById('pdfModal');
        if (modal) modal.style.display = 'none';
        this.pdfDoc = null;
        this.pageNum = 1;
        this.pdfUrl = null;
    }

    showAudioModal() {
        this.hideModals();
        const modal = document.getElementById('audioModal');
        if (modal) modal.style.display = 'flex';
        this.populateAudioList();
    }

    hideAudioModal() {
        const modal = document.getElementById('audioModal');
        if (modal) modal.style.display = 'none';
        this.stopAudio();
    }

    clearMainContent() {
        const mainContent = document.getElementById('mainContent');
        if (mainContent) mainContent.innerHTML = '';
    }

    async loadUserTracking() {
        if (!this.user) return;

        try {
            // Load tracking data from Supabase
            const { data, error } = await this.supabase
                .from('user_tracking')
                .select('*')
                .eq('user_id', this.user.id);

            if (error) {
                console.error('Error loading user tracking:', error);
                this.userTracking = {};
                return;
            }

            // Convert database data to tracking format
            this.userTracking = {};
            if (data) {
                data.forEach(record => {
                    this.userTracking[record.section_name] = {
                        visits: record.visit_count || 1,
                        lastVisited: record.last_visited,
                        timeSpent: record.time_spent || 0
                    };
                });
            }
            console.log('Loaded user tracking data:', this.userTracking);
        } catch (error) {
            console.error('Error loading tracking:', error);
            this.userTracking = {};
        }
    }

    async saveUserTracking() {
        if (!this.user) return;

        try {
            // Save each section's tracking data
            for (const [sectionName, data] of Object.entries(this.userTracking)) {
                const { error } = await this.supabase
                    .from('user_tracking')
                    .upsert([{
                        user_id: this.user.id,
                        section_name: sectionName,
                        visit_count: data.visits,
                        last_visited: data.lastVisited,
                        time_spent: data.timeSpent
                    }], {
                        onConflict: 'user_id,section_name'
                    });

                if (error) {
                    console.error('Error saving tracking data for', sectionName, ':', error);
                }
            }
        } catch (error) {
            console.error('Error saving tracking:', error);
        }
    }

    async logSessionStart() {
    if (!this.user) return;
    
    try {
        const sessionData = {
            user_id: this.user.id,
            participant_id: this.participantId,
            session_start: this.sessionStartTime.toISOString(),
            statistics_type: this.statisticsType,
            session_duration: 0,
            sections_visited: 1,
            total_time_spent: 0,
            preferred_sections: 'home',
            usage_pattern: 'initial_visit'
        };
        
        const { data, error } = await this.supabase
            .from('user_sessions')
            .insert([sessionData])
            .select();
            
        if (error) {
            console.error('Error logging session start:', error);
        } else if (data && data.length > 0) {
            this.sessionId = data[0].id;
            console.log('Session started with ID:', this.sessionId);
        }
    } catch (error) {
        console.error('Error logging session:', error);
    }
}
async trackVisit(section) {
    if (!this.user) {
        console.log('❌ Cannot track visit: No user logged in');
        return;
    }

    console.log('🔄 Tracking visit to section:', section, 'User:', this.user.id);
    
    try {
        // First, update local tracking
        if (!this.userTracking[section]) {
            this.userTracking[section] = {
                visits: 0,
                lastVisited: '',
                timeSpent: 0
            };
        }

        this.userTracking[section].visits++;
        this.userTracking[section].lastVisited = new Date().toISOString();

        // Then update database - use upsert to handle both insert and update
        const { data, error } = await this.supabase
            .from('section_visits')
            .upsert({
                user_id: this.user.id,
                participant_id: this.participantId,
                section_name: section,
                visit_count: this.userTracking[section].visits,
                last_visited: new Date().toISOString(),
                time_spent: this.userTracking[section].timeSpent || 0,
                updated_at: new Date().toISOString()
            }, {
                onConflict: 'user_id,section_name'
            })
            .select();

        if (error) {
            console.error('❌ Error tracking section visit in DB:', error);
            console.error('Error details:', error.message);
            console.error('Error code:', error.code);
            
            // If table doesn't exist, create a fallback
            if (error.code === '42P01') { // table doesn't exist
                console.error('❌ section_visits table does not exist!');
                this.createFallbackTracking(section);
            }
        } else {
            console.log('✅ Successfully tracked section visit:', section);
            console.log('Visit count:', this.userTracking[section].visits);
            console.log('Database response:', data);
        }
        
    } catch (error) {
        console.error('❌ Exception in trackVisit:', error);
    }
}

// Fallback method if table doesn't exist
createFallbackTracking(section) {
    console.log('📝 Using localStorage fallback for tracking');
    const key = `teenquest_tracking_${this.user.id}`;
    let tracking = JSON.parse(localStorage.getItem(key) || '{}');
    
    if (!tracking[section]) {
        tracking[section] = {
            visits: 0,
            lastVisited: '',
            timeSpent: 0
        };
    }
    
    tracking[section].visits++;
    tracking[section].lastVisited = new Date().toISOString();
    localStorage.setItem(key, JSON.stringify(tracking));
    
    // Also update local tracking
    this.userTracking[section] = tracking[section];
}
async testDatabaseConnection() {
    if (!this.user) {
        console.log('❌ No user logged in for database test');
        return;
    }

    try {
        console.log('🔍 Testing database connection...');
        
        // Test basic query
        const { data, error } = await this.supabase
            .from('section_visits')
            .select('*')
            .limit(1);

        if (error) {
            console.error('❌ Database connection test failed:', error);
            
            if (error.code === '42P01') {
                console.error('❌ TABLE NOT FOUND: section_visits table does not exist');
                console.log('💡 Please create the section_visits table in your Supabase database');
            }
        } else {
            console.log('✅ Database connection successful');
            console.log('Sample data:', data);
        }

        // Test if we can insert
        const testData = {
            user_id: this.user.id,
            participant_id: this.participantId,
            section_name: 'test_section',
            visit_count: 1,
            last_visited: new Date().toISOString(),
            time_spent: 0
        };

        const { data: insertData, error: insertError } = await this.supabase
            .from('section_visits')
            .insert([testData])
            .select();

        if (insertError) {
            console.error('❌ Insert test failed:', insertError);
        } else {
            console.log('✅ Insert test successful:', insertData);
            
            // Clean up test data
            await this.supabase
                .from('section_visits')
                .delete()
                .eq('id', insertData[0].id);
        }

    } catch (error) {
        console.error('❌ Database test error:', error);
    }
}
    async logSectionVisit(section) {
        if (!this.user) return;
        
        try {
            if (this.sectionStartTime && this.currentSection !== section) {
                const timeSpent = Math.floor((new Date() - this.sectionStartTime) / 1000);
                await this.updateSectionTime(this.currentSection, timeSpent);
            }
            
            this.sectionStartTime = new Date();
            
            const { error } = await this.supabase
                .from('section_visits')
                .upsert([{
                    user_id: this.user.id,
                    participant_id: this.participantId,
                    section_name: section,
                    last_visited: new Date().toISOString()
                }], {
                    onConflict: 'user_id,section_name'
                });
                
            if (error) {
                console.error('Error logging section visit:', error);
            }
        } catch (error) {
            console.error('Error logging section visit:', error);
        }
    }

    async updateSectionTime(section, timeSpent) {
        if (!this.user) return;
        
        try {
            if (this.userTracking[section]) {
                this.userTracking[section].timeSpent = (this.userTracking[section].timeSpent || 0) + timeSpent;
                await this.saveUserTracking();
            }
            
            const { error } = await this.supabase
                .from('section_visits')
                .update({
                    time_spent: this.userTracking[section]?.timeSpent || timeSpent,
                    visit_count: this.userTracking[section]?.visits || 1
                })
                .eq('user_id', this.user.id)
                .eq('section_name', section);
                
            if (error) {
                console.error('Error updating section time:', error);
            }
        } catch (error) {
            console.error('Error updating section time:', error);
        }
    }
    async updateDailyUsageSummary() {
    if (!this.user) return;
    
    try {
        // Calculate today's usage
        const today = new Date().toISOString().split('T')[0];
        
        // Get today's sessions
        const { data: sessions, error: sessionsError } = await this.supabase
            .from('user_sessions')
            .select('*')
            .eq('user_id', this.user.id)
            .gte('session_start', today + 'T00:00:00Z')
            .lte('session_start', today + 'T23:59:59Z');

        if (sessionsError) throw sessionsError;

        // Get today's section visits
        const { data: sections, error: sectionsError } = await this.supabase
            .from('section_visits')
            .select('section_name')
            .eq('user_id', this.user.id)
            .gte('last_visited', today + 'T00:00:00Z')
            .lte('last_visited', today + 'T23:59:59Z');

        if (sectionsError) throw sectionsError;

        // Get today's document interactions
        const { data: documents, error: docsError } = await this.supabase
            .from('document_interactions')
            .select('id')
            .eq('user_id', this.user.id)
            .gte('interacted_at', today + 'T00:00:00Z')
            .lte('interacted_at', today + 'T23:59:59Z');

        if (docsError) throw docsError;

        // Get today's audio interactions
        const { data: audio, error: audioError } = await this.supabase
            .from('audio_interactions')
            .select('id')
            .eq('user_id', this.user.id)
            .gte('interacted_at', today + 'T00:00:00Z')
            .lte('interacted_at', today + 'T23:59:59Z');

        if (audioError) throw audioError;

        // Calculate totals
        const totalSessions = sessions?.length || 0;
        const totalTimeSpent = sessions?.reduce((sum, session) => sum + (session.session_duration || 0), 0) || 0;
        const sectionsAccessed = [...new Set(sections?.map(s => s.section_name) || [])];
        const documentsViewed = documents?.length || 0;
        const audioPlayed = audio?.length || 0;

        // Update daily usage summary
        const { error } = await this.supabase
            .from('daily_usage_summary')
            .upsert([{
                user_id: this.user.id,
                participant_id: this.participantId,
                usage_date: today,
                total_sessions: totalSessions,
                total_time_spent: totalTimeSpent,
                sections_accessed: sectionsAccessed,
                documents_viewed: documentsViewed,
                audio_played: audioPlayed
            }], {
                onConflict: 'user_id,usage_date'
            });

        if (error) {
            console.error('Error updating daily usage summary:', error);
        } else {
            console.log('Daily usage summary updated for:', today);
        }
    } catch (error) {
        console.error('Error in updateDailyUsageSummary:', error);
    }
}

async logSessionEnd() {
    if (!this.user || !this.sessionStartTime) return;
    
    try {
        const sessionDuration = Math.floor((new Date() - this.sessionStartTime) / 1000);
        
        // Update session end time and duration
        const { error } = await this.supabase
            .from('user_sessions')
            .update({
                session_end: new Date().toISOString(),
                session_duration: sessionDuration
            })
            .eq('id', this.sessionId);
            
        if (error) {
            console.error('Error updating session end:', error);
        } else {
            console.log('Session data saved successfully');
            
            // Update daily usage summary after session ends
            await this.updateDailyUsageSummary();
        }
    } catch (error) {
        console.error('Error logging session end:', error);
    }
}
async startSectionTimeTracking(section) {
    this.sectionStartTime = new Date();
    console.log('⏱️ Started time tracking for:', section);
}

async updateSectionTime(section) {
    if (!this.sectionStartTime || !this.user) return;
    
    const timeSpent = Math.floor((new Date() - this.sectionStartTime) / 1000);
    console.log('⏱️ Time spent in', section + ':', timeSpent + ' seconds');
    
    // Update local tracking
    if (this.userTracking[section]) {
        this.userTracking[section].timeSpent = (this.userTracking[section].timeSpent || 0) + timeSpent;
    }

    // Update database
    try {
        const { error } = await this.supabase
            .from('section_visits')
            .update({
                time_spent: this.userTracking[section]?.timeSpent || timeSpent
            })
            .eq('user_id', this.user.id)
            .eq('section_name', section);

        if (error) {
            console.error('❌ Error updating section time:', error);
        } else {
            console.log('✅ Updated time spent for', section + ':', timeSpent + ' seconds');
        }
    } catch (error) {
        console.error('❌ Exception updating section time:', error);
    }
}

    determineUsagePattern() {
        const visits = Object.values(this.userTracking).map(s => s.visits || 0);
        const totalVisits = visits.reduce((a, b) => a + b, 0);
        
        if (totalVisits < 3) return 'minimal';
        if (visits.some(v => v > 3)) return 'focused';
        if (visits.length > 4) return 'exploratory';
        return 'balanced';
    }

showSection(section) {
    if (!this.user) {
        this.showModal('loginModal');
        return;
    }

    console.log('🔄 Switching to section:', section);
    
    // Update time for previous section before switching
    if (this.sectionStartTime && this.currentSection && this.currentSection !== section) {
        this.updateSectionTime(this.currentSection);
    }
    
    // Update current section
    this.currentSection = section;
    
    // Start time tracking for new section
    this.startSectionTimeTracking(section);
    
    // Remove all background classes
    document.body.classList.remove('home-bg', 'strategies-bg', 'study-bg', 'breathing-bg', 'exercise-bg', 'meditation-bg', 'tracking-bg', 'feedback-bg', 'profile-bg', 'research-team-bg', 'developer-bg');
    
    // Add the appropriate background class
    document.body.classList.add(`${section}-bg`);
    
    // Update navigation
    document.querySelectorAll('.nav-item').forEach(item => {
        item.classList.remove('active');
        if (item.dataset.section === section) {
            item.classList.add('active');
        }
    });

    // Load content
    const mainContent = document.getElementById('mainContent');
    if (mainContent) {
        mainContent.innerHTML = this.getSectionContent(section);
        this.setupDocumentEventListeners();
        
        // Scroll to top on mobile
        if (window.innerWidth <= 1024) {
            window.scrollTo(0, 0);
        }
    }

    // Track the visit - ADD A SMALL DELAY TO ENSURE CONTENT IS LOADED
    setTimeout(() => {
        console.log('📊 Calling trackVisit for:', section);
        this.trackVisit(section);
    }, 100);
}

    getSectionContent(section) {
        const sections = {
            home: this.getHomeContent(),
            strategies: this.getStrategiesContent(),
            study: this.getStudyContent(),
            breathing: this.getBreathingContent(),
            exercise: this.getExerciseContent(),
            meditation: this.getMeditationContent(),
            profile: this.getProfileContent(),
            tracking: this.getTrackingContent(),
            'research-team': this.getResearchTeamContent(),
            developer: this.getDeveloperContent(),
            feedback: this.getFeedbackContent()
        };

        return sections[section] || '<div class="content-card"><h2>Section Not Found</h2></div>';
    }

    getHomeContent() {
        const visitCounts = Object.values(this.userTracking).reduce((sum, section) => sum + (section.visits || 0), 0);
        const sectionsExplored = Object.keys(this.userTracking).length;

        return `
            

            <div class="hero-card">
                <h1>Welcome back!</h1>
                <p>Continue your journey in managing academic anxiety and building healthy study habits</p>
                <div class="button-group">
                    <button class="btn btn-primary" onclick="app.showSection('strategies')">
                        Continue Exploring
                    </button>
                    <button class="btn btn-secondary" onclick="app.showSection('tracking')">
                        View My Progress
                    </button>
                </div>
            </div>

            <div class="feature-grid">
                <div class="feature-card" onclick="app.showSection('strategies')">
                    <div class="feature-icon bg-blue">
                        <i class="fas fa-brain"></i>
                    </div>
                    <h3>Anxiety Strategies</h3>
                    <p>${this.userTracking.strategies?.visits || 0} visits</p>
                </div>

                <div class="feature-card" onclick="app.showSection('study')">
                    <div class="feature-icon bg-green">
                        <i class="fas fa-book-open"></i>
                    </div>
                    <h3>Study Habits</h3>
                    <p>${this.userTracking.study?.visits || 0} visits</p>
                </div>

                <div class="feature-card" onclick="app.showSection('breathing')">
                    <div class="feature-icon bg-purple">
                        <i class="fas fa-wind"></i>
                    </div>
                    <h3>Breathing Exercises</h3>
                    <p>${this.userTracking.breathing?.visits || 0} visits</p>
                </div>

                <div class="feature-card" onclick="app.showSection('exercise')">
                    <div class="feature-icon bg-orange">
                        <i class="fas fa-dumbbell"></i>
                    </div>
                    <h3>Physical Exercises</h3>
                    <p>${this.userTracking.exercise?.visits || 0} visits</p>
                </div>

                <div class="feature-card" onclick="app.showSection('meditation')">
                    <div class="feature-icon bg-teal">
                        <i class="fas fa-spa"></i>
                    </div>
                    <h3>Meditation</h3>
                    <p>${this.userTracking.meditation?.visits || 0} visits</p>
                </div>

                <div class="feature-card" onclick="app.showSection('profile')">
                    <div class="feature-icon bg-pink">
                        <i class="fas fa-user"></i>
                    </div>
                    <h3>My Profile</h3>
                    <p>${this.userTracking.profile?.visits || 0} visits</p>
                </div>
            </div>

            <div class="content-card">
                <h3>Your Journey So Far</h3>
                <div class="stats-grid">
                    <div class="stat-item">
                        <div class="stat-number">${sectionsExplored}</div>
                        <div class="stat-label">Sections Explored</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${visitCounts}</div>
                        <div class="stat-label">Total Visits</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${Object.keys(this.userTracking).filter(key => this.userTracking[key].visits > 1).length}</div>
                        <div class="stat-label">Revisited</div>
                    </div>
                    <div class="stat-item">
                        <div class="stat-number">${6 - sectionsExplored}</div>
                        <div class="stat-label">New to Explore</div>
                    </div>
                </div>
            </div>
            <div class="research-notice">
                <i class="fas fa-flask"></i>
                <strong>Research Study:</strong> Your interaction data is being collected anonymously for academic research purposes.
            </div>
        `;
    }

    getStrategiesContent() {
        return `
            <div class="hero-card">
                <h1>Academic Anxiety Management Strategies</h1>
                <p>Practical techniques to overcome academic stress and anxiety</p>
            </div>

            <div class="content-card">
                <h3>Cognitive Techniques</h3>
                <ul class="styled-list">
                    <li><span class="list-number">1</span> Identify and challenge negative thought patterns</li>
                    <li><span class="list-number">2</span> Practice positive self-talk and affirmations</li>
                    <li><span class="list-number">3</span> Reframe anxious thoughts into constructive ones</li>
                    <li><span class="list-number">4</span> Use the "5-4-3-2-1" grounding technique</li>
                </ul>
            </div>

            <div class="content-card">
                <h3>Time Management Tips</h3>
                <ul class="styled-list">
                    <li><span class="list-number">1</span> Break large tasks into smaller, manageable chunks</li>
                    <li><span class="list-number">2</span> Use the Pomodoro Technique (25 min work, 5 min break)</li>
                    <li><span class="list-number">3</span> Create realistic study schedules</li>
                    <li><span class="list-number">4</span> Prioritize tasks using the Eisenhower Matrix</li>
                </ul>
            </div>

            <div class="content-card">
                <h3>Stress Reduction Methods</h3>
                <ul class="styled-list">
                    <li><span class="list-number">1</span> Take regular breaks during study sessions</li>
                    <li><span class="list-number">2</span> Maintain a balanced sleep schedule</li>
                    <li><span class="list-number">3</span> Connect with supportive friends and family</li>
                    <li><span class="list-number">4</span> Engage in hobbies and activities you enjoy</li>
                </ul>
            </div>

            <div class="content-card">
                <h3>Downloadable Resources</h3>
                
                <div class="document-section">
                    <div class="document-header">
                        <div class="document-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="document-info">
                            <h4>Rewriting the Narrative of Academic Anxiety</h4>
                            <p>Complete guide to reframing your academic anxiety</p>
                        </div>
                    </div>
                    <div class="document-controls">
                        <button class="document-btn pdf-btn" data-document="anxiety-narrative" data-file="anxiety-narrative.pdf">
                            <i class="fas fa-file-pdf"></i> View PDF
                        </button>
                        <button class="document-btn download-doc-btn" data-document="anxiety-narrative" data-file="anxiety-narrative.pdf">
                            <i class="fas fa-download"></i> Download PDF
                        </button>
                        <button class="document-btn audio-btn" data-audio="anxiety-narrative">
                            <i class="fas fa-headphones"></i>
                        </button>
                    </div>
                </div>
            </div>
            <div class="research-notice">
                <i class="fas fa-flask"></i>
                <strong>Research Study:</strong> Your interaction with this content is being tracked for research purposes.
            </div>
        `;
        
    }

    getStudyContent() {
        return `
            <div class="hero-card bg-green">
                <h1>Effective Study Habits</h1>
                <p>Build productive study routines to overcome academic anxiety</p>
            </div>

            <div class="content-card">
                <h3>Effective Scheduling</h3>
                <ul class="styled-list">
                    <li><span class="list-number">1</span> Study during your peak concentration hours</li>
                    <li><span class="list-number">2</span> Create a consistent daily routine</li>
                    <li><span class="list-number">3</span> Schedule regular review sessions</li>
                    <li><span class="list-number">4</span> Allow buffer time for unexpected events</li>
                </ul>
            </div>

            <div class="content-card">
                <h3>Note-Taking Tips</h3>
                <ul class="styled-list">
                    <li><span class="list-number">1</span> Use the Cornell Method for organized notes</li>
                    <li><span class="list-number">2</span> Create visual aids like mind maps</li>
                    <li><span class="list-number">3</span> Summarize key points in your own words</li>
                    <li><span class="list-number">4</span> Review and refine notes within 24 hours</li>
                </ul>
            </div>

            <div class="content-card">
                <h3>Avoiding Procrastination</h3>
                <ul class="styled-list">
                    <li><span class="list-number">1</span> Start with the most challenging task first</li>
                    <li><span class="list-number">2</span> Use the "two-minute rule" for quick tasks</li>
                    <li><span class="list-number">3</span> Eliminate distractions from your study space</li>
                    <li><span class="list-number">4</span> Reward yourself after completing tasks</li>
                </ul>
            </div>

            <div class="content-card">
                <h3>Downloadable Resources</h3>
                
                <div class="document-section">
                    <div class="document-header">
                        <div class="document-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="document-info">
                            <h4>Effective Study Habits Guide</h4>
                            <p>Comprehensive guide to building effective study routines</p>
                        </div>
                    </div>
                    <div class="document-controls">
                        <button class="document-btn pdf-btn" data-document="study-habits" data-file="study-habits.pdf">
                            <i class="fas fa-file-pdf"></i> View PDF
                        </button>
                        <button class="document-btn download-doc-btn" data-document="study-habits" data-file="study-habits.pdf">
                            <i class="fas fa-download"></i> Download PDF
                        </button>
                        <button class="document-btn audio-btn" data-audio="study-habits">
                            <i class="fas fa-headphones"></i> 
                        </button>
                    </div>
                </div>
            </div>
                       <div class="research-notice">
                <i class="fas fa-flask"></i>
                <strong>Research Study:</strong> Your interaction with this content is being tracked for research purposes.
            </div>
        `;
    }

    getBreathingContent() {
        return `
            <div class="hero-card bg-purple">
                <h1>Deep Breathing Exercises</h1>
                <p>Calm your mind and reduce anxiety with breathing techniques</p>
            </div>

            <div class="content-card">
                <h3>4-7-8 Breathing Technique</h3>
                <ul class="styled-list">
                    <li><span class="list-number">1</span> Breathe in quietly through your nose for 4 counts</li>
                    <li><span class="list-number">2</span> Hold your breath for 7 counts</li>
                    <li><span class="list-number">3</span> Exhale completely through your mouth for 8 counts</li>
                    <li><span class="list-number">4</span> Repeat the cycle 3-4 times</li>
                </ul>
            </div>

            <div class="content-card">
                <h3>Box Breathing</h3>
                <ul class="styled-list">
                    <li><span class="list-number">1</span> Breathe in for 4 counts</li>
                    <li><span class="list-number">2</span> Hold for 4 counts</li>
                    <li><span class="list-number">3</span> Breathe out for 4 counts</li>
                    <li><span class="list-number">4</span> Hold for 4 counts</li>
                </ul>
            </div>

            <div class="content-card">
                <h3>Downloadable Resources</h3>
                
                <div class="document-section">
                    <div class="document-header">
                        <div class="document-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="document-info">
                            <h4>Guided Deep Breathing Exercises</h4>
                            <p>Step-by-step instructions for various breathing techniques</p>
                        </div>
                    </div>
                    <div class="document-controls">
                        <button class="document-btn pdf-btn" data-document="breathing-exercises" data-file="breathing-exercises.pdf">
                            <i class="fas fa-file-pdf"></i> View PDF
                        </button>
                        <button class="document-btn download-doc-btn" data-document="breathing-exercises" data-file="breathing-exercises.pdf">
                            <i class="fas fa-download"></i> Download PDF
                        </button>
                        <button class="document-btn audio-btn" data-audio="breathing-exercises">
                            <i class="fas fa-headphones"></i> 
                        </button>
                    </div>
                </div>
            </div>
                        <div class="research-notice">
                <i class="fas fa-flask"></i>
                <strong>Research Study:</strong> Your interaction with this content is being tracked for research purposes.
            </div>
        `;
    }

    getExerciseContent() {
        return `
            <div class="hero-card bg-orange">
                <h1>Physical Exercise for Anxiety Relief</h1>
                <p>Quick exercises to reduce stress and boost energy</p>
            </div>

            <div class="content-card">
                <h3>Quick Desk Stretches (5 minutes)</h3>
                <ul class="styled-list">
                    <li><span class="list-number">1</span> Neck rolls: 10 rotations each direction</li>
                    <li><span class="list-number">2</span> Shoulder shrugs: 15 repetitions</li>
                    <li><span class="list-number">3</span> Seated spinal twist: Hold 30 seconds each side</li>
                    <li><span class="list-number">4</span> Wrist and finger stretches</li>
                </ul>
            </div>

            <div class="content-card">
                <h3>Energy Boosting Workout (15 minutes)</h3>
                <ul class="styled-list">
                    <li><span class="list-number">1</span> Jumping jacks: 30 seconds</li>
                    <li><span class="list-number">2</span> High knees: 30 seconds</li>
                    <li><span class="list-number">3</span> Push-ups or modified push-ups: 10 reps</li>
                    <li><span class="list-number">4</span> Squats: 15 reps</li>
                    <li><span class="list-number">5</span> Repeat circuit 3 times</li>
                </ul>
            </div>

            <div class="content-card">
                <h3>Downloadable Resources</h3>
                
                <div class="document-section">
                    <div class="document-header">
                        <div class="document-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="document-info">
                            <h4>Guided Physical Exercises</h4>
                            <p>Illustrated guide to physical exercises for stress relief</p>
                        </div>
                    </div>
                    <div class="document-controls">
                        <button class="document-btn pdf-btn" data-document="physical-exercises" data-file="physical-exercises.pdf">
                            <i class="fas fa-file-pdf"></i> View PDF
                        </button>
                        <button class="document-btn download-doc-btn" data-document="physical-exercises" data-file="physical-exercises.pdf">
                            <i class="fas fa-download"></i> Download PDF
                        </button>
                        <button class="document-btn audio-btn" data-audio="physical-exercises">
                            <i class="fas fa-headphones"></i>
                        </button>
                    </div>
                </div>
            </div>
               <div class="research-notice">
                <i class="fas fa-flask"></i>
                <strong>Research Study:</strong> Your interaction with this content is being tracked for research purposes.
            </div>
        `;
    }

    getMeditationContent() {
        return `
           <div class="hero-card bg-teal">
                <h1>Meditation for Academic Anxiety</h1>
                <p>Find peace and focus through mindfulness practices</p>
            </div>

            <div class="content-card">
                <h3>5-Minute Mindfulness Meditation</h3>
                <ul class="styled-list">
                    <li><span class="list-number">1</span> Find a comfortable seated position</li>
                    <li><span class="list-number">2</span> Close your eyes or soften your gaze</li>
                    <li><span class="list-number">3</span> Focus on your breath</li>
                    <li><span class="list-number">4</span> Acknowledge thoughts without judgment</li>
                    <li><span class="list-number">5</span> Continue for 5 minutes</li>
                </ul>
            </div>

            <div class="content-card">
                <h3>Body Scan Meditation (10 minutes)</h3>
                <ul class="styled-list">
                    <li><span class="list-number">1</span> Lie down or sit comfortably</li>
                    <li><span class="list-number">2</span> Bring awareness to your toes</li>
                    <li><span class="list-number">3</span> Slowly move attention up through your body</li>
                    <li><span class="list-number">4</span> Notice tension without trying to change it</li>
                </ul>
            </div>

            <div class="content-card">
                <h3>Downloadable Resources</h3>
                
                <div class="document-section">
                    <div class="document-header">
                        <div class="document-icon">
                            <i class="fas fa-file-alt"></i>
                        </div>
                        <div class="document-info">
                            <h4>Guided Meditation Practices</h4>
                            <p>Complete guide to various meditation techniques</p>
                        </div>
                    </div>
                    <div class="document-controls">
                        <button class="document-btn pdf-btn" data-document="meditation-guide" data-file="meditation-guide.pdf">
                            <i class="fas fa-file-pdf"></i> View PDF
                        </button>
                        <button class="document-btn download-doc-btn" data-document="meditation-guide" data-file="meditation-guide.pdf">
                            <i class="fas fa-download"></i> Download PDF
                        </button>
                        <button class="document-btn audio-btn" data-audio="meditation-guide">
                            <i class="fas fa-headphones"></i>
                        </button>
                    </div>
                </div>
            </div>
                        <div class="research-notice">
                <i class="fas fa-flask"></i>
                <strong>Research Study:</strong> Your interaction with this content is being tracked for research purposes.
            </div>
        `;
    }

    getProfileContent() {
        if (!this.user) {
            return `
                <div class="content-card">
                    <h2>My Profile</h2>
                    <p>Please log in to view your profile.</p>
                </div>
            `;
        }

        return `

            <div class="hero-card">
                <h1>My Profile</h1>
                <p>Manage your account and research participation</p>
            </div>

            <div class="content-card">
                <h3>Personal Information</h3>
                <div class="profile-info">
                    <div class="info-item">
                        <label>Full Name:</label>
                        <span>${this.user.user_metadata?.full_name || 'Not provided'}</span>
                    </div>
                    <div class="info-item">
                        <label>Email:</label>
                        <span>${this.user.email}</span>
                    </div>
                    <div class="info-item">
                        <label>Participant ID:</label>
                        <span>${this.participantId || 'Not assigned'}</span>
                    </div>
                    <div class="info-item">
                        <label>Account Created:</label>
                        <span>${new Date(this.user.created_at).toLocaleDateString()}</span>
                    </div>
                    <div class="info-item">
                        <label>Last Login:</label>
                        <span>${new Date(this.user.last_sign_in_at).toLocaleDateString()}</span>
                    </div>
                </div>
            </div>

            <div class="content-card">
                <h3>Research Participation</h3>
                <div class="research-status">
                    <div class="status-item active">
                        <i class="fas fa-check-circle"></i>
                        <div>
                            <strong>Active Participant</strong>
                            <p>You are currently participating in the TeenQuest research study</p>
                        </div>
                    </div>
                    <div class="status-item">
                        <i class="fas fa-chart-line"></i>
                        <div>
                            <strong>Data Collection</strong>
                            <p>Your anonymous usage data is being collected for research analysis</p>
                        </div>
                    </div>
                    <div class="status-item">
                        <i class="fas fa-shield-alt"></i>
                        <div>
                            <strong>Privacy Protected</strong>
                            <p>All personal information is stored securely and anonymized for research</p>
                        </div>
                    </div>
                </div>
            </div>

            <div class="content-card">
                <h3>Study Progress</h3>
                <div class="progress-stats">
    <div class="progress-item">
        <div class="progress-number">${Object.keys(this.userTracking).length}</div>
        <div class="progress-label">Sections Explored</div>
    </div>
    <div class="progress-item">
        <div class="progress-number">${Object.values(this.userTracking).reduce((sum, section) => sum + (section.visits || 0), 0)}</div>
        <div class="progress-label">Total Visits</div>
    </div>
    <div class="progress-item">
        <div class="progress-number">${Math.floor(Object.values(this.userTracking).reduce((sum, section) => sum + (section.timeSpent || 0), 0) / 60)}</div>
        <div class="progress-label">Minutes Engaged</div>
    </div>
</div>
                </div>
            </div>

            <div class="content-card">
                <h3>Account Management</h3>
                <div class="account-actions">
                    <button class="btn btn-secondary" onclick="app.showSection('tracking')">
                        <i class="fas fa-chart-bar"></i> View Detailed Progress
                    </button>
                    <button class="btn btn-secondary" onclick="app.showSection('feedback')">
                        <i class="fas fa-comment"></i> Provide Feedback
                    </button>
                    <button class="btn btn-primary" onclick="app.handleLogout()">
                        <i class="fas fa-sign-out-alt"></i> Logout
                    </button>
                </div>
            </div>
                        <div class="research-notice">
                <i class="fas fa-flask"></i>
                <strong>Research Study:</strong> Your profile information is stored securely for research purposes.
            </div>
        `;
    }

    getTrackingContent() {
        const sections = [
            { id: 'strategies', name: 'Anxiety Strategies' },
            { id: 'study', name: 'Study Habits' },
            { id: 'breathing', name: 'Breathing Exercises' },
            { id: 'exercise', name: 'Physical Exercises' },
            { id: 'meditation', name: 'Meditation' },
            { id: 'profile', name: 'My Profile' },
            { id: 'tracking', name: 'My Progress' },
            { id: 'research-team', name: 'Research Team' },
            { id: 'developer', name: 'Developer' },
            { id: 'feedback', name: 'Feedback' }
        ];

        return `
            <div class="hero-card bg-pink">
                <h1>Your Progress Dashboard</h1>
                <p>Track your journey towards better mental health</p>
            </div>

            <div class="content-card">
                <h3>Your Usage Statistics</h3>
                ${Object.keys(this.userTracking).length === 0 ? `
                    <div style="text-align: center; padding: 3rem;">
                        <div style="font-size: 3rem; color: #ccc; margin-bottom: 1rem;">
                            <i class="fas fa-chart-bar"></i>
                        </div>
                        <p style="color: #666; margin-bottom: 2rem;">Start exploring sections to see your progress!</p>
                        <button class="btn btn-primary" onclick="app.showSection('strategies')">
                            Get Started
                        </button>
                    </div>
                ` : `
                    <div style="display: grid; gap: 1rem;">
                        ${sections.map(section => {
                            const data = this.userTracking[section.id];
                            if (!data) return '';

                            return `
                                <div style="display: flex; justify-content: space-between; align-items: center; padding: 1rem; background: #f8f9fa; border-radius: 12px;">
                                    <div>
                                        <strong>${section.name}</strong>
                                        <div style="font-size: 0.875rem; color: #666;">
                                            Last visited: ${new Date(data.lastVisited).toLocaleDateString()}
                                        </div>
                                        <div style="font-size: 0.875rem; color: #888;">
                                            Time spent: ${Math.floor(data.timeSpent / 60)} minutes
                                        </div>
                                    </div>
                                    <span style="background: #667eea; color: white; padding: 0.25rem 0.75rem; border-radius: 20px; font-size: 0.875rem;">
                                        ${data.visits} ${data.visits === 1 ? 'visit' : 'visits'}
                                    </span>
                                </div>
                            `;
                        }).join('')}
                    </div>
                `}
            </div>
                 <div class="research-notice">
                <i class="fas fa-flask"></i>
                <strong>Research Study:</strong> Your progress data is being collected for research analysis.
            </div>
        `;
    }

    getResearchTeamContent() {
        return `
           <div class="hero-card">
                <h1>Research Team</h1>
                <p>Meet the dedicated professionals and students behind the TeenQuest research study</p>
            </div>

            <div class="content-card">
                <h2>Department Heads</h2>
                <div class="team-grid">
                    ${this.researchTeam.heads.map(head => `
                        <div class="team-member">
                            <div class="member-image">
                                <img src="${head.image}" alt="${head.name}" onerror="this.src='assets/placeholder-avatar.jpg'">
                            </div>
                            <div class="member-info">
                                <h3>${head.name}</h3>
                                <p class="member-role">${head.role}</p>
                                <p class="member-qualifications">${head.qualifications}</p>
                                
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="content-card">
                <h2>Student Research Team</h2>
                <div class="team-grid student-grid">
                    ${this.researchTeam.students.map(student => `
                        <div class="team-member student-member">
                            <div class="member-image">
                                <img src="${student.image}" alt="${student.name}" onerror="this.src='assets/placeholder-avatar.jpg'">
                            </div>
                            <div class="member-info">
                                <h3>${student.name}</h3>
                                <p class="member-role">${student.role}</p>
                                
                               
                            </div>
                        </div>
                    `).join('')}
                </div>
            </div>

            <div class="content-card">
                <h2>Research Objectives</h2>
                <div class="research-objectives">
                    <div class="objective-item">
                        <i class="fas fa-brain"></i>
                        <div>
                            <h3>Understand Academic Anxiety</h3>
                            <p>Investigate the prevalence and impact of academic anxiety among teenage students</p>
                        </div>
                    </div>
                    <div class="objective-item">
                        <i class="fas fa-tools"></i>
                        <div>
                            <h3>Develop Interventions</h3>
                            <p>Create evidence-based digital interventions to help manage academic stress</p>
                        </div>
                    </div>
                    <div class="objective-item">
                        <i class="fas fa-chart-line"></i>
                        <div>
                            <h3>Measure Effectiveness</h3>
                            <p>Evaluate the impact of digital tools on anxiety reduction and academic performance</p>
                        </div>
                    </div>
                    <div class="objective-item">
                        <i class="fas fa-graduation-cap"></i>
                        <div>
                            <h3>Support Student Success</h3>
                            <p>Provide accessible mental health resources to support student wellbeing and success</p>
                        </div>
                    </div>
                </div>
            </div>
                <div class="research-notice">
                <i class="fas fa-flask"></i>
                <strong>Research Study:</strong> This project is conducted by a dedicated team of researchers and students.
            </div>
        `;
    }

getDeveloperContent() {
    return `
        <div class="hero-card">
            <h1>Developer Profile</h1>
            <p>About the development of the TeenQuest platform</p>
        </div>

        <div class="content-card">
            <div class="developer-profile">
                <div class="developer-image">
                    <img src="assets/team/Kripa PP.jpg" alt="Developer" onerror="this.src='assets/placeholder-avatar.jpg'">
                </div>
                <div class="developer-info">
                    <h2>Kripashankar Sattanathan</h2>
                    <p class="developer-role"> AI Researcher & Cloud Engineer </p>
                    <p> Pursuing MTech in AI(Part Time),
                        College of Engineering Technology,
                        SRM Institute of Science and Technology, Kattankulathur </p>
                    <div class="developer-details">
                        <div class="detail-item">
                            <i class="fas fa-university"></i>
                            <span> AI Research & Cloud Solutions</span>
                        </div>
                        <div class="detail-item">
                            <i class="fas fa-code"></i>
                            <span>Web Development & Research Technology</span>
                        </div>

                    </div>
                </div>
            </div>
        </div>

        <div class="content-card">
            <h3>About This Platform</h3>
            <div class="platform-info">
<p>The TeenQuest platform was developed by Kripashankar Sattanathan as part of an academic research study investigating the effectiveness of digital interventions for managing academic anxiety in teenage students.</p>                
                <div class="tech-stack">
                    <h4>Technology Stack</h4>
                    <div class="tech-items">
                        <span class="tech-item">HTML5 & CSS3</span>
                        <span class="tech-item">JavaScript ES6+</span>
                        <span class="tech-item">Supabase Backend</span>
                        <span class="tech-item">PDF.js Integration</span>
                        <span class="tech-item">Responsive Design</span>
                        <span class="tech-item">Audio Web API</span>
                        <span class="tech-item">Cloud Infrastructure</span>
                    </div>
                </div>

                <div class="features-list">
                    <h4>Platform Features</h4>
                    <ul>
                        <li>User authentication and profile management</li>
                        <li>Interactive anxiety management resources</li>
                        <li>Audio-guided meditation and breathing exercises</li>
                        <li>PDF document viewer and download capabilities</li>
                        <li>Progress tracking and usage analytics</li>
                        <li>Research data collection infrastructure</li>
                        <li>Responsive design for all devices</li>
                        <li>Secure data storage and privacy protection</li>
                    </ul>
                </div>
            </div>
        </div>

        <div class="content-card">
            <h3>Research Integration</h3>
            <div class="research-integration">
                <div class="integration-item">
                    <i class="fas fa-database"></i>
                    <div>
                        <h4>Data Collection</h4>
                        <p>Anonymous usage data is collected to study engagement patterns and intervention effectiveness</p>
                    </div>
                </div>
                <div class="integration-item">
                    <i class="fas fa-shield-alt"></i>
                    <div>
                        <h4>Privacy Protection</h4>
                        <p>All data is anonymized and stored securely in compliance with research ethics standards</p>
                    </div>
                </div>
                <div class="integration-item">
                    <i class="fas fa-chart-bar"></i>
                    <div>
                        <h4>Analytics</h4>
                        <p>Comprehensive tracking of user engagement with different intervention types</p>
                    </div>
                </div>
                <div class="integration-item">
                    <i class="fas fa-user-check"></i>
                    <div>
                        <h4>Participant Management</h4>
                        <p>Secure participant registration and consent management system</p>
                    </div>
                </div>
            </div>
        </div>

        <div class="content-card">
            <h3>Contact & Collaboration</h3>
            <div class="contact-info">
                <p>For technical collaboration, research partnerships, or platform development inquiries:</p>
                <div class="contact-details">
                    <div class="contact-item">
                        <i class="fas fa-building"></i>
                        <span>Solregin - AI Research & Cloud Solutions</span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-globe"></i>
                        <span>
                            <a href="https://kripashankar14.github.io/SolreignSoftech/" target="_blank" style="color: var(--vibrant-blue); text-decoration: none;">
                                https://Solreign.com
                            </a>
                        </span>
                    </div>
                    <div class="contact-item">
                        <i class="fas fa-envelope"></i>
                        <span>teenquestapp@gmail.com</span>
                    </div>
                </div>
            </div>
        </div>
            <div class="research-notice">
            <i class="fas fa-flask"></i>
            <strong>Research Study:</strong> This platform was developed to support our research on academic anxiety.
        </div>
    `;
}

    getFeedbackContent() {
        return `
          <div class="hero-card bg-blue">
                <h1>Which are the features did you find most helpful?</h1>
                <p>Help us improve your experience and contribute to our research</p>
            </div>

            <div class="content-card">
                <form id="feedbackForm">
                    <div class="form-group">
                        <label>How satisfied are you with this app? *</label>
                        <div class="rating-buttons">
                            ${[1,2,3,4,5].map(num => `
                                <button type="button" class="rating-btn" data-rating="${num}">${num}</button>
                            `).join('')}
                        </div>
                        <p style="text-align: center; color: #666; margin-top: 0.5rem; font-size: 0.875rem;">
                            1 = Not satisfied, 5 = Very satisfied
                        </p>
                    </div>

                    <div class="form-group">
                        <label>Which feature did you find most helpful? *</label>
                        <select class="form-control" id="helpfulFeature" required>
                            <option value="">Select a feature</option>
                            <option value="strategies">Anxiety Management Strategies</option>
                            <option value="study">Study Habits</option>
                            <option value="breathing">Breathing Exercises</option>
                            <option value="exercise">Physical Exercises</option>
                            <option value="meditation">Meditation</option>
                            <option value="tracking">Progress Tracking</option>
                            <option value="profile">My Profile</option>
                            <option value="research-team">Research Team</option>
                            <option value="developer">Developer Information</option>
                        </select>
                    </div>

                    <div class="form-group">
                        <label>Suggestions for improvement</label>
                        <textarea class="form-control" id="suggestions" placeholder="Share your thoughts and suggestions..." rows="5"></textarea>
                    </div>

                    <button type="submit" class="btn btn-primary" style="width: 100%; padding: 1.25rem;">
                        Submit Feedback
                    </button>
                </form>
            </div>
            <div class="research-notice">
                <i class="fas fa-flask"></i>
                <strong>Research Study:</strong> Your feedback will be stored securely and used for research analysis.
            </div>
        `;
    }

setupDocumentEventListeners() {
    // Set up PDF view buttons
    document.querySelectorAll('.pdf-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const fileName = e.target.closest('.pdf-btn').dataset.file;
            await this.logDocumentInteraction(fileName, 'view');
            this.viewPdf(fileName);
        });
    });

    // Set up download document buttons
    document.querySelectorAll('.download-doc-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const fileName = e.target.closest('.download-doc-btn').dataset.file;
            await this.logDocumentInteraction(fileName, 'download');
            this.downloadDocument(fileName);
        });
    });

    // Set up audio buttons
    document.querySelectorAll('.audio-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            const audioId = e.target.closest('.audio-btn').dataset.audio;
            await this.logAudioInteractionStart(audioId);
            this.playAudio(audioId);
        });
    });
}
async logDocumentInteraction(documentName, interactionType) {
    if (!this.user) return;
    
    try {
        const { error } = await this.supabase
            .from('document_interactions')
            .insert([{
                user_id: this.user.id,
                participant_id: this.participantId,
                document_name: documentName,
                interaction_type: interactionType,
                duration: 0, // You can track duration if you implement it
                interacted_at: new Date().toISOString()
            }]);

        if (error) {
            console.error('Error logging document interaction:', error);
        } else {
            console.log('Document interaction logged:', documentName, interactionType);
        }
    } catch (error) {
        console.error('Error logging document interaction:', error);
    }
}

    async viewPdf(fileName) {
        try {
            this.pdfUrl = `assets/documents/${fileName}`;
            document.getElementById('pdfTitle').textContent = fileName.replace('.pdf', '').replace(/-/g, ' ');
            
            // Load the PDF
            const loadingTask = pdfjsLib.getDocument(this.pdfUrl);
            this.pdfDoc = await loadingTask.promise;
            
            // Reset page number
            this.pageNum = 1;
            
            // Update page count
            document.getElementById('pageCount').textContent = this.pdfDoc.numPages;
            
            // Render the first page
            await this.renderPage(this.pageNum);
            
            // Show the PDF modal
            this.showPdfModal();
        } catch (error) {
            console.error('Error loading PDF:', error);
            alert('Error loading PDF. Please make sure the file exists in the assets/documents folder.');
        }
    }

    async renderPage(num) {
        this.pageRendering = true;
        
        try {
            // Get the page
            const page = await this.pdfDoc.getPage(num);
            
            // Set up canvas
            const canvas = document.getElementById('pdfCanvas');
            const ctx = canvas.getContext('2d');
            const container = document.querySelector('.pdf-container');
            
            // Set canvas dimensions based on PDF page size and container
            const scale = Math.min(container.clientWidth / page.getViewport({ scale: 1.0 }).width, 1.0);
            const viewport = page.getViewport({ scale });
            
            canvas.height = viewport.height;
            canvas.width = viewport.width;
            
            // Render PDF page into canvas context
            const renderContext = {
                canvasContext: ctx,
                viewport: viewport
            };
            
            await page.render(renderContext).promise;
            
            // Update page number
            document.getElementById('pageNum').textContent = num;
            
            this.pageRendering = false;
            
            // If there's a pending page, render it
            if (this.pageNumPending !== null) {
                this.renderPage(this.pageNumPending);
                this.pageNumPending = null;
            }
        } catch (error) {
            console.error('Error rendering PDF page:', error);
            this.pageRendering = false;
        }
    }

    queueRenderPage(num) {
        if (this.pageRendering) {
            this.pageNumPending = num;
        } else {
            this.renderPage(num);
        }
    }

    onPrevPage() {
        if (this.pageNum <= 1) {
            return;
        }
        this.pageNum--;
        this.queueRenderPage(this.pageNum);
    }

    onNextPage() {
        if (this.pageNum >= this.pdfDoc.numPages) {
            return;
        }
        this.pageNum++;
        this.queueRenderPage(this.pageNum);
    }

    downloadPdf() {
        if (this.pdfUrl) {
            const link = document.createElement('a');
            link.href = this.pdfUrl;
            link.download = this.pdfUrl.split('/').pop();
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
        }
    }

    playAudio(audioId) {
        const sectionAudio = this.audioFiles[this.currentSection];
        if (sectionAudio) {
            const audioFile = sectionAudio.find(a => a.id === audioId);
            if (audioFile) {
                this.currentAudio = audioFile;
                this.showAudioModal();
                this.loadAudio(audioFile);
            }
        }
    }

    loadAudio(audioFile) {
        // Create audio element if it doesn't exist
        if (!this.audioPlayer) {
            this.audioPlayer = new Audio();
            this.setupAudioEvents();
        }
        
        // Set audio source
        this.audioPlayer.src = `assets/audio/${audioFile.file}`;
        
        // Update UI
        document.getElementById('audioTitle').textContent = audioFile.title;
        document.getElementById('currentAudioTitle').textContent = audioFile.title;
        document.getElementById('audioDuration').textContent = audioFile.duration;
        
        // Reset progress
        document.getElementById('progress').style.width = '0%';
        document.getElementById('currentTime').textContent = '00:00';
        document.getElementById('totalTime').textContent = '00:00';
        
        // Highlight active audio in list
        this.highlightActiveAudio(audioFile.id);
    }
    async logAudioInteractionStart(audioId) {
    if (!this.user) return;
    
    try {
        const { error } = await this.supabase
            .from('audio_interactions')
            .insert([{
                user_id: this.user.id,
                participant_id: this.participantId,
                audio_name: audioId,
                play_duration: 0,
                completed: false,
                interacted_at: new Date().toISOString()
            }]);

        if (error) {
            console.error('Error logging audio interaction start:', error);
        } else {
            console.log('Audio interaction started:', audioId);
        }
    } catch (error) {
        console.error('Error logging audio interaction start:', error);
    }
}

async logAudioInteractionComplete(audioId, duration) {
    if (!this.user) return;
    
    try {
        const { error } = await this.supabase
            .from('audio_interactions')
            .update({
                play_duration: duration,
                completed: true,
                interacted_at: new Date().toISOString()
            })
            .eq('user_id', this.user.id)
            .eq('audio_name', audioId)
            .eq('completed', false);

        if (error) {
            console.error('Error logging audio interaction complete:', error);
        } else {
            console.log('Audio interaction completed:', audioId, 'Duration:', duration);
        }
    } catch (error) {
        console.error('Error logging audio interaction complete:', error);
    }
}

    setupAudioEvents() {
    this.audioPlayer.addEventListener('loadedmetadata', () => {
        document.getElementById('totalTime').textContent = this.formatTime(this.audioPlayer.duration);
    });
    
    this.audioPlayer.addEventListener('timeupdate', () => {
        const progress = (this.audioPlayer.currentTime / this.audioPlayer.duration) * 100;
        document.getElementById('progress').style.width = `${progress}%`;
        document.getElementById('currentTime').textContent = this.formatTime(this.audioPlayer.currentTime);
    });
    
    this.audioPlayer.addEventListener('ended', () => {
        this.isPlaying = false;
        document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
        
        // Log audio completion
        if (this.currentAudio) {
            this.logAudioInteractionComplete(this.currentAudio.id, Math.floor(this.audioPlayer.duration));
        }
    });
}
    togglePlayPause() {
        if (!this.audioPlayer) return;
        
        if (this.isPlaying) {
            this.audioPlayer.pause();
            document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
        } else {
            this.audioPlayer.play();
            document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-pause"></i>';
        }
        
        this.isPlaying = !this.isPlaying;
    }

    toggleMute() {
        if (!this.audioPlayer) return;
        
        this.audioPlayer.muted = !this.audioPlayer.muted;
        document.getElementById('muteBtn').innerHTML = this.audioPlayer.muted ? 
            '<i class="fas fa-volume-mute"></i>' : '<i class="fas fa-volume-up"></i>';
    }

    setProgress(e) {
        if (!this.audioPlayer) return;
        
        const progressBar = document.getElementById('progressBar');
        const clickX = e.offsetX;
        const width = progressBar.offsetWidth;
        const duration = this.audioPlayer.duration;
        
        this.audioPlayer.currentTime = (clickX / width) * duration;
    }

    stopAudio() {
        if (this.audioPlayer) {
            this.audioPlayer.pause();
            this.audioPlayer.currentTime = 0;
            this.isPlaying = false;
            document.getElementById('playPauseBtn').innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    populateAudioList() {
        const audioItems = document.getElementById('audioItems');
        audioItems.innerHTML = '';
        
        const sectionAudio = this.audioFiles[this.currentSection];
        if (sectionAudio) {
            sectionAudio.forEach(audio => {
                const audioItem = document.createElement('div');
                audioItem.className = 'audio-item';
                audioItem.dataset.audioId = audio.id;
                
                audioItem.innerHTML = `
                    <div class="audio-item-info">
                        <div class="audio-item-title">${audio.title}</div>
                        <div class="audio-item-duration">${audio.duration}</div>
                    </div>
                    <button class="audio-btn" data-audio="${audio.id}">
                        <i class="fas fa-play"></i>
                    </button>
                `;
                
                audioItem.addEventListener('click', (e) => {
                    if (!e.target.classList.contains('audio-btn')) {
                        this.playAudio(audio.id);
                    }
                });
                
                audioItems.appendChild(audioItem);
            });
        }
    }

    highlightActiveAudio(audioId) {
        document.querySelectorAll('.audio-item').forEach(item => {
            item.classList.remove('active');
            if (item.dataset.audioId === audioId) {
                item.classList.add('active');
            }
        });
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '00:00';
        
        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }

    downloadDocument(fileName) {
        // Create a temporary link to download the document
        const link = document.createElement('a');
        link.href = `assets/documents/${fileName}`;
        link.download = fileName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    async submitFeedback(formData) {
        if (!this.user) return false;
        
        try {
            const { error } = await this.supabase
                .from('user_feedback')
                .insert([{
                    user_id: this.user.id,
                    participant_id: this.participantId,
                    satisfaction_rating: formData.rating,
                    helpful_feature: formData.feature,
                    suggestions: formData.suggestions
                }]);
                
            if (error) {
                console.error('Error submitting feedback:', error);
                return false;
            }
            
            return true;
        } catch (error) {
            console.error('Error submitting feedback:', error);
            return false;
        }
    }
}


// Initialize the app
const app = new AcademicAnxietyApp();

// Event listeners for rating buttons and feedback form
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('rating-btn')) {
        document.querySelectorAll('.rating-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        e.target.classList.add('active');
    }
});

document.addEventListener('submit', async function(e) {
    if (e.target.id === 'feedbackForm') {
        e.preventDefault();
        
        if (!app.user) {
            app.showModal('loginModal');
            return;
        }
        
        const ratingBtn = document.querySelector('.rating-btn.active');
        if (!ratingBtn) {
            alert('Please select a satisfaction rating');
            return;
        }

        const featureSelect = document.getElementById('helpfulFeature');
        if (!featureSelect.value) {
            alert('Please select the most helpful feature');
            return;
        }

        const formData = {
            rating: parseInt(ratingBtn.dataset.rating),
            feature: featureSelect.value,
            suggestions: document.getElementById('suggestions').value
        };
        
        const success = await app.submitFeedback(formData);
        
        if (success) {
            alert('Thank you for your feedback! Your response has been recorded for our research.');
            app.showSection('home');
        } else {
            alert('Error submitting feedback. Please try again.');
        }
    }
});

window.addEventListener('beforeunload', () => {
    app.logSessionEnd();
});

document.addEventListener('visibilitychange', () => {
    if (document.visibilityState === 'hidden') {
        app.logSessionEnd();
    }
});
