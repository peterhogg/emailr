const re = /^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
export default (emails) =>{
	let invalidEmails = emails
		.split(",")
		.map((email)=>{return email.trim()})
		.filter((email)=>{return re.test(email) === false});

	if(invalidEmails.length){
		return `The following emails are invalid: ${invalidEmails}`;
	}
	return;
};