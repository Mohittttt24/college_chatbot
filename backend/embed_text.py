# Run this script using:
# .venv\Scripts\python embed_text.py

import sys
import os

# Import models to register with SQLAlchemy
from models.user import User
from models.document import Document
from models.faq import FAQ
from models.chat_history import ChatHistory

from database import SessionLocal
from services.document_service import DocumentService
from services.embedding_service import EmbeddingService
from services.qdrant_service import QdrantService
from config import settings

# Content to add to RAG
text_content = """ALVA'S INSTITUTE OF ENGINEERING AND TECHNOLOGY (AIET)
Comprehensive Institutional Profile, Curriculum, Governance, Fees, Regulations, and Cultural Framework
__________________________________________________________________

1. Institutional Governance & Approvals
Alva's Institute of Engineering and Technology (AIET) was established in the year 2008 by the prestigious Alva’s Education Foundation (R) under the visionary stewardship of Chairman Dr. M. Mohan Alva. The foundational institute holds an esteemed tier position in the state of Karnataka for seamlessly linking deep engineering acumen with rigorous cultural, artistic, and athletic human development pathways.
•	Affiliation: Visvesvaraya Technological University (VTU), Belagavi. The entire curriculum stands fully updated and integrated with the National Education Policy (NEP) guidelines, blending multi-disciplinary core choices and application-driven milestones.
•	Approvals: Fully accredited and approved by the All India Council for Technical Education (AICTE), New Delhi, and recognized directly by the Directorate of Technical Education, Government of Karnataka.
•	Accreditations: Reaccredited with highly rated marks by the National Assessment and Accreditation Council (NAAC). The core tech pathways including Computer Science & Engineering (CSE) and Electronics & Communication Engineering (ECE) hold prestigious National Board of Accreditation (NBA) tier status.
2. Campus Architecture & Infrastructure Ecosystem
The institutional ecosystem is strategically based in Mijar, Moodbidri, positioned approximately 32 kilometers from the coastal transport hub of Mangalore along the primary National Highway 169.
•	The Shobhavana Campus: Encompassing a vast area of beautifully curated landscape, the facility provides an optimal green framework designed explicitly to foster academic quietude far removed from dense urban clusters.
•	Technical Infrastructure: Features deep state-of-the-art multi-million laboratory setups, high-throughput campus-wide fiber internet grids, multi-media modern learning seminar halls, and a vast centralized library catalog coupled with full electronic research databases.
•	AICTE IDEA Lab: A flagship advanced production node configured with the council to empower engineering students to rapidly translate theoretical engineering paradigms into production-grade physical hardware prototypes using advanced 3D printers, precision laser profiling machines, and high-performance microprocessor workstations.
3. Academic Programs & Admission Matrix
Undergraduate Programs (4-Year B.E. / B.Tech)
AIET delivers heavily requested modern engineering specializations to maintain a dynamic edge alongside global structural market adjustments:
•	 Computer Science & Engineering (CSE)
•	 Information Science & Engineering (ISE)
•	 Artificial Intelligence & Machine Learning (AI & ML)
•	 CSE in IoT & Cyber Security including Block Chain Technology 
•	CSE in Data Science
•	 Electronics & Communication Engineering (ECE)
•	 Mechanical Engineering
•	 Civil Engineering
•	 Agriculture Engineering
Postgraduate Programs (2-Year)
•	 Master of Business Administration (MBA) - featuring core specializations in Corporate Finance, Strategy Marketing, Human Resource Management, alongside cross-functional double-major routes.
•	 M.Tech in Computer Science & Engineering
•	 M.Tech in Thermal Power Engineering
Admission Entry Pathways & Cutoff Projections
Seat allocation matrices are systematically parsed down into three regulated statutory entry tracks: KCET (45%), COMEDK UGET (30%), and Institutional Management Quota (25%).
•	Academic Eligibility Criteria: Successful completion of 10+2 / Higher Secondary / PUC equivalent with mandatory tracking in Physics and Mathematics alongside a chooseable option of Chemistry, Biology, or Computer Science, holding a net score aggregate minimum of 45% (40% for restricted SC/ST/OBC categories). Post-grad management entrants must score at least 50% aggregate (45% for SC/ST) via PGCET, KMAT, or related common tests.
•	Historical Admission Trends: Computing lines remain highly competitive. Under standard state government KCET counseling protocols, general merit rankings for primary Computer Science and AI & ML track vectors close within the top 65,000 to 72,000 tiers. Alternative technical branches like Information Science (ISE) and core systems (Civil/Mechanical) stretch outwards up to 1,85,000+ rankings.
4. Structural Financial Cost Profile
Academic and auxiliary infrastructure costs are broken down transparently based on the category of seat procurement and specializations:
•	B.E. / B.Tech Fee Scaling: Total cumulative 4-year standard tuition obligations slide from a base of ₹3,20,000 (standard state government quotas in core branches) up to ₹10,00,000 for high-demand advanced computing brackets under private Management quotas.
•	MBA / M.Tech Tiers: Standardized smoothly at roughly ₹1,25,000 per academic calendar term.
•	Hostel Rental Outlays: Fixed between ₹25,000 to ₹45,000 annually based on structural room preferences. Quarters are organized primarily into standard triple-sharing floor patterns fitted out with study elements, structural wardrobes, and ergonomic utilities. An introductory setup framework fee of approximately ₹18,000 is managed at the entry line.
•	Mess & Dining Operations: Managed dynamically via a prepaid transactional accounting methodology averaging near ₹2,500 every calendar month. The cooking zones strictly separate clean vegetarian and non-vegetarian food lines.
5. Placement Architectures, Corporate Linkages & Alva's Pragati
The campus operates a dedicated Training & Placement Cell that rolls out structural professional capabilities starting from the sophomore calendar period, emphasizing data structures, algorithmic tracking, core programming languages, and psychological mock HR testing.
•	Placement Ratios: Sustains an impressive outcome benchmark consistently above 85% for circuit and digital computing lines (CSE, ISE, ECE). Structural mechanical and structural civil streams log average employment distributions around 75-80%.
•	Salary Vectors: Historical peaks match ₹21 LPA (achieved through Juspay) and secondary highs at ₹20 LPA (procured via Amazon India). The overall median corporate framework scales between ₹3.5 LPA to ₹4.5 LPA.
•	Primary Corporate Partners: Amazon, IBM Global Services, Microsoft, Infosys Springboard, Capgemini India, Accenture, Wipro, Tata Consultancy Services (TCS), Robert Bosch, Cognizant, NTT Data, Mphasis, and Tech Mahindra.
•	Alva's Pragati (Mega Placement Initiative): A cornerstone achievement of the parent Alva’s Education Foundation. This stands out as South India’s premier open pool-campus hiring event, pulling in over 150 to 200 high-scale MNC corporate houses annually, generating thousands of active job opportunities for AIET undergraduates and regional talent pools alike.
6. Campus Discipline, Rules & Lifestyle Codes
•	Attendance Regulations: An absolute hard threshold of 85% standalone physical attendance is mandatory across every discrete theory class and lab sequence. Failure to secure this threshold automatically invokes University (VTU) debarment procedures.
•	Electronic Restrictions & Code of Attire: Portable electronics are banned from active operational use inside all lecture rooms and laboratory areas. Standard formal codes of dress behavior must be maintained at all times.
•	Hostel Structural Framework: Compulsory silent academic study hours are monitored every night from 9:00 PM to 11:00 PM. External exits from the structural perimeter are heavily guarded during weekdays, allowing general local outings primarily on Sundays upon physical signature clearance from the block warden.
7. Cultural Identity, Creative Assemblies & Active Student Clubs
Distinct from standard engineering environments, AIET enforces a deep integration of arts, heritage, and civic responsibilities into the foundational learning curve:
•	Chakravyuh Mega Fest: The hallmark annual national-scale techno-cultural fiesta drawing engineering teams statewide. Integrates major battle of the bands, intense Nukkad Natak (street plays), cultural fashion columns, and full ethnic exhibitions.
•	Alva’s Virasat & Nudisiri Ecosystem: Students secure immediate access to the foundation’s massive cultural platforms. Virasat highlights legendary classical maestros of Indian music and dance, whereas Nudisiri maps out elite milestones in literary arts and research.
•	Alva’s Samskrutika Vaibhava: A highly praised state-touring artistic variety troupe composed entirely of trained student performers highlighting legendary Indian art formats, classical Bharatanatyam, Kathak, tribal North-East stick dances, aerial Mallakhamba, and coastal Karnataka’s legendary operatic theatre, Yakshagana.
Specialized Student Clubs & Operational Focus
Club Categorization	Official Club Name	Primary Focus & Student Engagements
Cultural & Arts	The Cultural Umbrella / Kannada & Tulu Sangha	Hosts regular fine arts camps, classical dance masterclasses, and regional drama skits reviving native traditions.
Oratory & Media	Rostrum Speakers Club / Image In Media	Drills out public speaking fear via mock MUNs and debates. Handles live digital video production and media editing.
Advanced Tech	Coders Club / Algoris / Apple iOS Suite	Manages localized 24-hour hackathons, structural bug hunting sprints, and deep-tech algorithmic optimization forums.
Wellness & Duty	Adhyatma Spiritual / NCC / NSS Units	Fosters student mental health through early yoga protocols, community cleaning drives, and rigorous military SSB selection training.

8. Administrative Communications Matrix
•	Mailing Address: Shobhavana Campus, Mijar, Moodbidri, Mangalore, Dakshina Kannada District, Karnataka, India - 574225.
•	Electronic Inquiries: principalaiet08@gmail.com | info@alvas.org
•	Official Central Portal: www.aiet.org.in
•	Admissions Telephony: +91 80505 85606 / +91 70262 62725 / +91 94484 58334 / 08258-262724
"""

db = SessionLocal()
qdrant_service = QdrantService()
embedding_service = EmbeddingService()

try:
    # 1. Save content to a local text file
    filename = "Alvas_Institute_Profile.txt"
    local_path = os.path.join("static", "uploads", filename)
    os.makedirs(os.path.dirname(local_path), exist_ok=True)
    with open(local_path, "w", encoding="utf-8") as f:
        f.write(text_content)
    print(f"Saved text content to {local_path}")

    # 2. Get first admin user or default to ID 1
    admin_user = db.query(User).filter(User.is_admin == True).first()
    user_id = admin_user.id if admin_user else 1

    # 3. Save metadata to PostgreSQL
    db_doc = Document(
        filename=filename,
        s3_key=local_path,
        file_url=f"/static/uploads/{filename}",
        user_id=user_id
    )
    db.add(db_doc)
    db.commit()
    db.refresh(db_doc)
    print(f"Registered document in database with ID: {db_doc.id}")

    # 4. Chunk text
    chunk_size = 500
    chunk_overlap = 50
    chunks = []
    start = 0
    while start < len(text_content):
        end = start + chunk_size
        chunks.append(text_content[start:end])
        start += chunk_size - chunk_overlap

    print(f"Generated {len(chunks)} chunks.")

    # 5. Generate embeddings
    embeddings = embedding_service.embed_texts(chunks)

    # 6. Upload to Qdrant
    uploaded_count = qdrant_service.upsert_chunks(
        name=settings.QDRANT_COLLECTION_NAME,
        texts=chunks,
        embeddings=embeddings,
        document_id=db_doc.id,
        filename=db_doc.filename
    )
    print(f"Successfully uploaded {uploaded_count} chunks to Qdrant!")
    print("RAG database is now populated and ready!")

finally:
    db.close()
