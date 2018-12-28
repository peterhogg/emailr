const mongoose = require('mongoose');
const {Path} = require('path-parser');
const { URL } = require('url');
const _ = require('lodash');
const requireLogin = require('../middlewares/requireLogin');
const requireCredits = require('../middlewares/requireCredits');

const Mailer = require("../services/Mailer");
const surveyTemplate = require("../services/emailTemplates/surveyTemplate"); 

const Survey = mongoose.model('surveys');

module.exports = app => {

	app.get('/api/surveys', requireLogin, async (req,res) =>{
		const surveys = await Survey
			.find({
				_user: req.user.id,
			})
			.select({
				recipients: false,
			}
		);

		res.send(surveys);
	})

	app.get('/api/surveys/:surveyID/:choice', (req,res) =>{
		res.send('Thank you for your feedback!');
	});

	app.post('/api/surveys/webhooks', (req,res) =>{
		const p = new Path('/api/surveys/:surveyID/:choice');
		let events = req.body.map(({email, url}) => {
			let match = p.test(new URL(url).pathname);
			if(match){
				return {email, surveyID: match.surveyID, choice: match.choice};
			}
		});
		
		let compactEvents = events.filter(Boolean);
		let uniqueEvents = _.uniqBy(compactEvents, 'email', 'surveyID');

		uniqueEvents.forEach(({email, surveyID, choice})=>{
			Survey.updateOne(
				{
					_id: surveyID,
					recipients: {
						$elemMatch: {email: email, responded: false}
					}
				}, {
					$inc: { [choice]: 1 },
					$set: {'recipients.$.responded': true},
					lastResponded: new Date(),
				}
			).exec();
		})
		res.send({});
	});

	app.post('/api/surveys', requireLogin, requireCredits, async (req,res) => {
		const {title, subject, body, recipients} = req.body;

		const survey = new Survey({
			title,
			subject,
			body,
			recipients: recipients.split(',').map(email => ({email: email.trim()})),
			_user: req.user.id,
			dateSent : Date.now()			
		})

		// Send out the email
		const mailer = new Mailer(survey, surveyTemplate(survey));

		try{
			await mailer.send();
			await survey.save();
			req.user.credits -=1;
			const user = await req.user.save();
			
			res.send(user);
		}
		catch(error){
			res.status(422).send(error);
		}
	})
};