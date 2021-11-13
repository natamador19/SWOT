const nodemailer = require('nodemailer');

const mailTransport = nodemailer.createTransport({
    service:'gmail',
    auth:{
        user: process.env.mail_user,
        pass: process.env.mail_pass
    }
});
const mailSender=(to, subject,body)=>{

    const mailOptions={
        "from":'process.env.mail_user',
        "to":to,
        "subject":subject,
        //"text":body
        "html":body
    }
    mailTransport.sendMail(mailOptions,(err,info)=>{
        if(err){
            console.log(err);
        }else{
            console.log(`Email Sent: ${info.response}`);
        }
    });
}
module.exports=mailSender;