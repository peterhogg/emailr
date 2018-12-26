import React from 'react';
import {connect} from 'react-redux';
import { withRouter} from 'react-router-dom';
import formFields from './formFields';
import * as actions from "../../actions";

const SurveyFormReview = ({onCancel, formValues, submitSurvey, history}) =>{

	const reviewFields = formFields.map(({label, name}) => {
		return (
			<div key={name}>
				<label>{label}</label>
				<div>{formValues[name]}</div>
			</div>
		);
	})

	return (
		<div>
			<h5>Review</h5>
			<div>
				{reviewFields}
			</div>
			<button 
				className="yellow darken-2 white-text btn-flat"
				onClick={onCancel}
			>Back</button>
			<button 
				onClick={() => submitSurvey(formValues, history)}
				className="green btn-flat right white-text">
				Send Survey <i className="material-icons">email</i>
			</button>
		</div>
	);
};

function mapStateToProps(state) {
	return {
		formValues: state.form.surveyForm.values
	};

}

export default connect(mapStateToProps, actions)(withRouter(SurveyFormReview));