from app import app, db

class Sessions(db.Model):
	__tablename__ = 'sessions'
	session_id = db.Column(db.Integer, primary_key=True)
	app = db.Column(db.String(255))
	r_id = db.Column(db.Integer)
	user_id = db.Column(db.Integer)
	session_date = db.Column(db.String(255))

class Bejeweled_Sessions(db.Model):
	__tablename__ = 'bejeweled_sessions'
	session_id = db.Column(db.Integer, db.ForeignKey('sessions.session_id'), primary_key = True)
	attempt_number = db.Column(db.Integer, primary_key = True)
	level = db.Column(db.Integer)
	target_score = db.Column(db.Integer)
	tile_types = db.Column(db.Integer)
	score_total = db.Column(db.Integer)
	score_zone = db.Column(db.String(255))
	latency_average = db.Column(db.Float)
	events = db.Column(db.Text)

	sessions = db.relationship(Sessions)

class Wordsearch_Sessions(db.Model):
	__tablename__ = 'wordsearch_sessions'
	session_id = db.Column(db.Integer, db.ForeignKey('sessions.session_id'), primary_key = True)
	attempt_number = db.Column(db.Integer, primary_key = True)
	level = db.Column(db.Text)
	version = db.Column(db.Integer)
	rows = db.Column(db.Integer)
	words = db.Column(db.Integer)
	latency_average = db.Column(db.Float)
	longest_word = db.Column(db.Integer)
	longest_pause = db.Column(db.Float)
	events = db.Column(db.Text)

	sessions = db.relationship(Sessions)


class Mole_Sessions(db.Model):
	__tablename__ = 'mole_sessions'
	session_id = db.Column(db.Integer, db.ForeignKey('sessions.session_id'), primary_key = True)
	target_visibility = db.Column(db.Integer)
	target_latency = db.Column(db.Integer)
	attempt_duration = db.Column(db.Integer)
	level_progression = db.Column(db.Float)
	hit_sound = db.Column(db.Integer)
	hit_vibration = db.Column(db.Integer)
	avg_reaction_time = db.Column(db.Float)
	reaction_time_sd = db.Column(db.Float)
	events = db.Column(db.Text)
	avg_reaction_time_by_attempt = db.Column(db.Text)
	reaction_time_sds_by_attempt = db.Column(db.Text)
	moles_hit_by_attempt = db.Column(db.Text)
	moles_missed_by_attempt = db.Column(db.Text)
	bunnies_hit_by_attempt = db.Column(db.Text)
	bunnies_missed_by_attempt = db.Column(db.Text)

	sessions = db.relationship(Sessions)







	
