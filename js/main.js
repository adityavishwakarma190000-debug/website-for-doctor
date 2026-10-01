/**
 * =====================================================================
 * AVALON HEALTHCARE & ADVANCED MEDICINE - CORE JAVASCRIPT
 * Features:
 *  1. Spline 3D Integration Slot & Live Link Switcher
 *  2. Interactive Three.js 3D Medical DNA / Vital Core
 *  3. Interactive 3D Card Tilt with Specular Lighting
 *  4. Interactive Symptom Triage & Specialist Matcher
 *  5. Appointment Booking System & Time-Slot Picker
 *  6. FAQ Accordion & Navigation Controls
 * =====================================================================
 */

// =====================================================================
// [1] 3D CONFIGURATION
// Default active: Diagonal 3D Medical DNA Core (Three.js)
// Spline URL can be loaded via the 3D modal or set here
// =====================================================================
const USER_SPLINE_URL = '';


document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  init3DHeroElement();
  initSplineTesterModal();
  init3DTiltCards();
  initSymptomTriage();
  initBookingSystem();
  initFaqAccordion();
});

/**
 * ---------------------------------------------------------------------
 * 1. Navbar Scroll Effect & Mobile Drawer
 * ---------------------------------------------------------------------
 */
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  const mobileToggle = document.querySelector('.mobile-toggle');
  const navLinks = document.querySelector('.nav-links');

  window.addEventListener('scroll', () => {
    if (window.scrollY > 40) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  });

  if (mobileToggle && navLinks) {
    mobileToggle.addEventListener('click', () => {
      navLinks.classList.toggle('active');
    });

    // Close when clicking nav links
    navLinks.querySelectorAll('a').forEach(link => {
      link.addEventListener('click', () => {
        navLinks.classList.remove('active');
      });
    });
  }
}

/**
 * ---------------------------------------------------------------------
 * 2. 3D Hero Element (Spline Integration + Built-in Three.js 3D Fallback)
 * ---------------------------------------------------------------------
 */
let threeRenderer, threeScene, threeCamera, threeAnimationId;

function init3DHeroElement() {
  const container = document.getElementById('spline-3d-container');
  if (!container) return;

  // Check if user has defined a Spline URL
  if (USER_SPLINE_URL && USER_SPLINE_URL.trim() !== '') {
    const existingViewer = container.querySelector('spline-viewer');
    if (existingViewer && existingViewer.getAttribute('url') === USER_SPLINE_URL) {
      const badgeText = document.getElementById('spline-badge-label');
      if (badgeText) badgeText.textContent = 'Spline 3D Active';
      return;
    }
    loadSplineViewer(USER_SPLINE_URL, false);
  } else {
    // Render our custom 3D Medical WebGL experience
    renderThreeJsMedicalCore(container);
  }
}

/**
 * Load external Spline 3D Scene via spline-viewer web component
 */
function loadSplineViewer(splineUrl, isUserAction = false) {
  const container = document.getElementById('spline-3d-container');
  if (!container) return;

  // Stop Three.js if running
  if (threeAnimationId) {
    cancelAnimationFrame(threeAnimationId);
  }
  container.innerHTML = '';

  const splineViewer = document.createElement('spline-viewer');
  splineViewer.setAttribute('url', splineUrl);
  splineViewer.setAttribute('loading-anim-type', 'spinner-small-dark');
  splineViewer.style.width = '100%';
  splineViewer.style.height = '100%';

  container.appendChild(splineViewer);

  // Update status badge
  const badgeText = document.getElementById('spline-badge-label');
  if (badgeText) {
    badgeText.textContent = 'Spline 3D Active';
  }

  if (isUserAction) {
    showToast('Spline 3D Scene Loaded Successfully!');
  }
}

/**
 * Custom 3D Medical WebGL Double-Helix (Diagonal, Moveable, Auto-Repositioning)
 */
function renderThreeJsMedicalCore(container) {
  if (typeof THREE === 'undefined') {
    console.warn('Three.js not loaded, skipping 3D canvas');
    return;
  }

  // Stop previous animation loop if running
  if (threeAnimationId) {
    cancelAnimationFrame(threeAnimationId);
  }

  container.innerHTML = '';

  const width = container.clientWidth || window.innerWidth;
  const height = container.clientHeight || 750;

  // 1. Scene & Camera
  threeScene = new THREE.Scene();
  threeCamera = new THREE.PerspectiveCamera(40, width / height, 0.1, 1000);
  threeCamera.position.set(0, 0, 24);

  // 2. High-Performance Renderer with Alpha Transparency
  threeRenderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, powerPreference: 'high-performance' });
  threeRenderer.setSize(width, height);
  threeRenderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  container.appendChild(threeRenderer.domElement);

  // 3. Anchor Group (Sets Fixed Diagonal Orientation & Placement)
  const DEFAULT_TILT_Z = -Math.PI / 4.2; // approx -43° diagonal
  const DEFAULT_TILT_X = 0.26;          // slight 3D front pitch
  const DEFAULT_POS_X = width < 768 ? 0 : 2.5; // centered on mobile, right-offset on desktop
  const DEFAULT_POS_Y = 0.0;

  const dnaAnchorGroup = new THREE.Group();
  dnaAnchorGroup.rotation.z = DEFAULT_TILT_Z;
  dnaAnchorGroup.rotation.x = DEFAULT_TILT_X;
  dnaAnchorGroup.position.set(DEFAULT_POS_X, DEFAULT_POS_Y, -0.5);
  threeScene.add(dnaAnchorGroup);

  // 4. Rotatable DNA Core (Handles axial spin & person's manual drag rotation)
  const dnaCore = new THREE.Group();
  dnaAnchorGroup.add(dnaCore);

  // Geometry configuration: Fixed proportional size
  const strandCount = 60;
  const radius = 3.7;
  const heightSpan = 30; // spans across the entire diagonal
  const rStep = heightSpan / strandCount;

  // Materials
  const sphereGeo = new THREE.SphereGeometry(0.26, 20, 20);
  const cyanMat = new THREE.MeshPhongMaterial({
    color: 0x06b6d4,
    emissive: 0x0891b2,
    emissiveIntensity: 0.65,
    shininess: 95
  });

  const blueMat = new THREE.MeshPhongMaterial({
    color: 0x0284c7,
    emissive: 0x0369a1,
    emissiveIntensity: 0.55,
    shininess: 95
  });

  const rungLineMat = new THREE.LineBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.55
  });

  // Construct the Double Helix
  for (let i = 0; i < strandCount; i++) {
    const y = (i - strandCount / 2) * rStep;
    const angle = i * 0.36;

    // Node 1 (Cyan)
    const x1 = Math.cos(angle) * radius;
    const z1 = Math.sin(angle) * radius;
    const mesh1 = new THREE.Mesh(sphereGeo, cyanMat);
    mesh1.position.set(x1, y, z1);
    dnaCore.add(mesh1);

    // Node 2 (Blue)
    const x2 = Math.cos(angle + Math.PI) * radius;
    const z2 = Math.sin(angle + Math.PI) * radius;
    const mesh2 = new THREE.Mesh(sphereGeo, blueMat);
    mesh2.position.set(x2, y, z2);
    dnaCore.add(mesh2);

    // Connecting Rung Line
    const lineGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(x1, y, z1),
      new THREE.Vector3(x2, y, z2)
    ]);
    const line = new THREE.Line(lineGeo, rungLineMat);
    dnaCore.add(line);
  }

  // Floating Quantum Bio-Shield Rings
  const ringGeo1 = new THREE.TorusGeometry(5.4, 0.05, 16, 120);
  const ringMat1 = new THREE.MeshBasicMaterial({
    color: 0x38bdf8,
    transparent: true,
    opacity: 0.35,
    wireframe: true
  });
  const bioRing1 = new THREE.Mesh(ringGeo1, ringMat1);
  bioRing1.rotation.x = Math.PI / 3;
  dnaCore.add(bioRing1);

  const ringGeo2 = new THREE.TorusGeometry(4.8, 0.04, 16, 100);
  const ringMat2 = new THREE.MeshBasicMaterial({
    color: 0x06b6d4,
    transparent: true,
    opacity: 0.25,
    wireframe: true
  });
  const bioRing2 = new THREE.Mesh(ringGeo2, ringMat2);
  bioRing2.rotation.y = Math.PI / 4;
  dnaCore.add(bioRing2);

  // Ambient Floating Bio-Molecules
  const particlesCount = 90;
  const particleGeo = new THREE.BufferGeometry();
  const positions = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i += 3) {
    positions[i] = (Math.random() - 0.5) * 22;
    positions[i + 1] = (Math.random() - 0.5) * 28;
    positions[i + 2] = (Math.random() - 0.5) * 16;
  }
  particleGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleMat = new THREE.PointsMaterial({
    color: 0x38bdf8,
    size: 0.24,
    transparent: true,
    opacity: 0.75
  });
  const particleCloud = new THREE.Points(particleGeo, particleMat);
  dnaCore.add(particleCloud);

  // 5. Lighting (Cool Azure & Ambient Glow)
  const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
  threeScene.add(ambientLight);

  const keyLight = new THREE.DirectionalLight(0x38bdf8, 1.6);
  keyLight.position.set(12, 18, 18);
  threeScene.add(keyLight);

  const fillLight = new THREE.PointLight(0x06b6d4, 1.8, 50);
  fillLight.position.set(-12, -8, 12);
  threeScene.add(fillLight);

  const backLight = new THREE.PointLight(0x0284c7, 1.2, 40);
  backLight.position.set(0, 12, -10);
  threeScene.add(backLight);

  // 6. Interactive Movement & Smooth Auto-Repositioning
  let isDragging = false;
  let previousMousePos = { x: 0, y: 0 };
  let dragRotX = 0;       // Manual rotation offset on X
  let dragRotY = 0;       // Manual rotation offset on Y
  let spinAngle = 0;      // Natural continuous axial spin
  let mouseX = 0, mouseY = 0;

  // Pointer / Mouse events
  const onPointerDown = (clientX, clientY) => {
    isDragging = true;
    previousMousePos = { x: clientX, y: clientY };
  };

  const onPointerMove = (clientX, clientY) => {
    const rect = container.getBoundingClientRect();
    mouseX = ((clientX - rect.left) / rect.width) * 2 - 1;
    mouseY = -(((clientY - rect.top) / rect.height) * 2 - 1);

    if (isDragging) {
      const deltaX = clientX - previousMousePos.x;
      const deltaY = clientY - previousMousePos.y;

      // Add to manual rotation
      dragRotY += deltaX * 0.008;
      dragRotX += deltaY * 0.008;

      previousMousePos = { x: clientX, y: clientY };
    }
  };

  const onPointerUp = () => {
    isDragging = false;
  };

  // Mouse Listeners
  container.addEventListener('mousedown', (e) => onPointerDown(e.clientX, e.clientY));
  window.addEventListener('mousemove', (e) => onPointerMove(e.clientX, e.clientY));
  window.addEventListener('mouseup', onPointerUp);

  // Touch Listeners (Mobile & Tablet)
  container.addEventListener('touchstart', (e) => {
    if (e.touches.length > 0) {
      onPointerDown(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchmove', (e) => {
    if (e.touches.length > 0) {
      onPointerMove(e.touches[0].clientX, e.touches[0].clientY);
    }
  }, { passive: true });

  window.addEventListener('touchend', onPointerUp);

  // 7. Animation Loop with Auto-Repositioning
  const clock = new THREE.Clock();

  function animate() {
    threeAnimationId = requestAnimationFrame(animate);

    const elapsedTime = clock.getElapsedTime();

    // 1. Natural axial continuous spin
    spinAngle += 0.011;

    // 2. Smooth Auto-Repositioning Physics:
    // When the person is NOT dragging, smoothly lerp/spring drag rotation back to 0!
    if (!isDragging) {
      dragRotX += (0 - dragRotX) * 0.045; // Smooth spring-back to home
      dragRotY += (0 - dragRotY) * 0.045;
    }

    // Apply combined rotations
    dnaCore.rotation.y = spinAngle + dragRotY;
    dnaCore.rotation.x = dragRotX;

    // Outer quantum rings subtle rotation
    bioRing1.rotation.z += 0.006;
    bioRing2.rotation.x += 0.008;

    // 3. Gentle ambient floating & subtle mouse parallax
    const targetPosY = DEFAULT_POS_Y + Math.sin(elapsedTime * 1.4) * 0.35;
    const targetPosX = DEFAULT_POS_X + (mouseX * 0.6);
    dnaAnchorGroup.position.y += (targetPosY - dnaAnchorGroup.position.y) * 0.05;
    dnaAnchorGroup.position.x += (targetPosX - dnaAnchorGroup.position.x) * 0.05;

    // Maintain diagonal orientation with subtle organic flex
    dnaAnchorGroup.rotation.z = DEFAULT_TILT_Z + Math.sin(elapsedTime * 0.8) * 0.015;

    threeRenderer.render(threeScene, threeCamera);
  }

  animate();

  // Resize Listener
  window.addEventListener('resize', () => {
    if (!container || !threeRenderer || !threeCamera) return;
    const newWidth = container.clientWidth || window.innerWidth;
    const newHeight = container.clientHeight || 750;
    threeCamera.aspect = newWidth / newHeight;
    threeCamera.updateProjectionMatrix();
    threeRenderer.setSize(newWidth, newHeight);

    // Reposition for mobile vs desktop
    dnaAnchorGroup.position.x = newWidth < 768 ? 0 : 2.5;
  });
}

/**
 * ---------------------------------------------------------------------
 * 3. Spline Link Live Tester Modal
 * ---------------------------------------------------------------------
 */
function initSplineTesterModal() {
  const openBtn = document.getElementById('open-spline-modal');
  const modal = document.getElementById('spline-modal');
  const closeBtn = document.getElementById('close-spline-modal');
  const applyBtn = document.getElementById('apply-spline-url-btn');
  const resetBtn = document.getElementById('reset-3d-btn');
  const input = document.getElementById('spline-url-input');

  if (!modal) return;

  if (openBtn) {
    openBtn.addEventListener('click', () => {
      modal.classList.add('active');
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener('click', () => {
      modal.classList.remove('active');
    });
  }

  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      modal.classList.remove('active');
    }
  });

  if (applyBtn && input) {
    applyBtn.addEventListener('click', () => {
      const url = input.value.trim();
      if (!url) {
        showToast('Please enter a valid Spline URL');
        return;
      }
      loadSplineViewer(url, true);
      modal.classList.remove('active');
    });
  }

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      const container = document.getElementById('spline-3d-container');
      const badgeText = document.getElementById('spline-badge-label');
      if (badgeText) badgeText.textContent = '3D DNA Helix Active';
      renderThreeJsMedicalCore(container);
      modal.classList.remove('active');
      showToast('Switched to Diagonal 3D DNA Helix');
    });
  }
}

/**
 * ---------------------------------------------------------------------
 * 4. Interactive 3D Card Tilt with Specular Reflection
 * ---------------------------------------------------------------------
 */
function init3DTiltCards() {
  const cards = document.querySelectorAll('.card-3d-tilt');

  cards.forEach(card => {
    card.addEventListener('mousemove', (e) => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -10; // Max 10 deg
      const rotateY = ((x - centerX) / centerX) * 10;

      card.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) translateY(-4px)`;
    });

    card.addEventListener('mouseleave', () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateY(0px)`;
    });
  });
}

/**
 * ---------------------------------------------------------------------
 * 5. Interactive Symptom Triage & Specialist Matcher
 * ---------------------------------------------------------------------
 */
function initSymptomTriage() {
  const chips = document.querySelectorAll('.symptom-chip');
  const title = document.getElementById('triage-title');
  const desc = document.getElementById('triage-desc');
  const actionBtn = document.getElementById('triage-action-btn');
  const serviceSelect = document.getElementById('appointment-service');

  const triageData = {
    'Chest Tightness / Palpitations': {
      specialty: 'Cardiovascular Care',
      recommendation: 'Priority consultation with Dr. Vance. ECG & Echocardiogram evaluation advised within 24-48 hours.',
      time: 'Approx. 45 mins'
    },
    'Chronic Fatigue & Low Energy': {
      specialty: 'Preventive & Longevity Medicine',
      recommendation: 'Comprehensive metabolic & hormonal biomarker blood panel with personalized health optimization roadmap.',
      time: 'Approx. 60 mins'
    },
    'High Blood Pressure': {
      specialty: 'Cardiovascular Care',
      recommendation: '24-hour ambulatory arterial pressure monitoring and medication recalibration.',
      time: 'Approx. 30 mins'
    },
    'Annual Preventive Checkup': {
      specialty: 'Comprehensive Executive Health',
      recommendation: 'Full systemic diagnostic screening, body composition, cardiovascular stress test, and longevity consultation.',
      time: 'Approx. 90 mins'
    },
    'Headaches & Dizziness': {
      specialty: 'Advanced Neurological Diagnostics',
      recommendation: 'Cranial ultrasound and hemodynamic vascular assessment with clinical review.',
      time: 'Approx. 40 mins'
    },
    'Sleep Apnea & Restlessness': {
      specialty: 'Cardiorespiratory Health',
      recommendation: 'Home nocturnal pulse-oximetry and sleep architecture analysis.',
      time: 'Approx. 30 mins'
    }
  };

  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');

      const symptomName = chip.textContent.trim();
      const match = triageData[symptomName];

      if (match && title && desc) {
        title.textContent = `${match.specialty} Recommended`;
        desc.textContent = `${match.recommendation} (${match.time})`;

        if (serviceSelect) {
          // Preselect corresponding service in the booking form
          for (let option of serviceSelect.options) {
            if (option.text.toLowerCase().includes(match.specialty.toLowerCase().slice(0, 8))) {
              option.selected = true;
              break;
            }
          }
        }
      }
    });
  });

  if (actionBtn) {
    actionBtn.addEventListener('click', () => {
      const bookingSection = document.getElementById('booking');
      if (bookingSection) {
        bookingSection.scrollIntoView({ behavior: 'smooth' });
      }
    });
  }
}

/**
 * ---------------------------------------------------------------------
 * 6. Appointment Booking System & Time-Slot Picker
 * ---------------------------------------------------------------------
 */
function initBookingSystem() {
  const form = document.getElementById('appointment-form');
  const slotButtons = document.querySelectorAll('.time-slot-btn');
  const hiddenTimeInput = document.getElementById('selected-time-slot');

  slotButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      slotButtons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      if (hiddenTimeInput) {
        hiddenTimeInput.value = btn.textContent.trim();
      }
    });
  });

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const name = document.getElementById('patient-name')?.value || 'Valued Patient';
      const service = document.getElementById('appointment-service')?.value || 'General Consultation';
      const date = document.getElementById('appointment-date')?.value || 'Upcoming date';
      const slot = hiddenTimeInput?.value || '09:00 AM';

      showToast(`Appointment requested for ${name} on ${date} at ${slot}!`);
      form.reset();
      slotButtons.forEach((b, index) => {
        if (index === 0) b.classList.add('active');
        else b.classList.remove('active');
      });
    });
  }
}

/**
 * ---------------------------------------------------------------------
 * 7. FAQ Accordion
 * ---------------------------------------------------------------------
 */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const question = item.querySelector('.faq-question');
    if (!question) return;

    question.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
      });

      if (!isActive) {
        item.classList.add('active');
      }
    });
  });
}

/**
 * ---------------------------------------------------------------------
 * Utility: Toast Notifications
 * ---------------------------------------------------------------------
 */
function showToast(message) {
  let toast = document.querySelector('.toast-notice');
  if (!toast) {
    toast = document.createElement('div');
    toast.className = 'toast-notice';
    document.body.appendChild(toast);
  }

  toast.innerHTML = `
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
      <polyline points="22 4 12 14.01 9 11.01"></polyline>
    </svg>
    <span>${message}</span>
  `;

  toast.classList.add('show');

  setTimeout(() => {
    toast.classList.remove('show');
  }, 4000);
}
