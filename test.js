const supertest = require('supertest');
var expect = require("chai").expect;
var _ = require('lodash');
var response;
var output;
var milliseconds = new Date().getTime();
var check = require('check-types');
var Create_User = {
"userID": {"merchantUserID": "userID_"+milliseconds},
"managedMerchantIdentity": "ABCCORP",
"accountCurrency": "GBP",
"payerIdentity": {
  "individualIdentity": {
    "name": {
      "familyName": "Smith",
      "givenNames": "John"
    },
    "address": {
      "addressLine1": "ABC",
       "city": "ABC",
      "country": "GB",
      "postcode": "EC1A 4HY",
      "province": "ABC"
    },
    "birthInformation": {
      "cityOfBirth": "ABC",
      "countryOfBirth": "GB",
      "dateOfBirth": "2001-01-01"
    },
    "identification": [
       {
         "idType": "Passport",
         "identificationCountry": "GB",
         "identificationNumber": "180397E52078",
         "validFromDate": "2001-01-01",
         "validToDate": "2001-01-01"
       }
     ]
  }
}
};

var Create_ben={
  "benBankID":{ "merchantBankID": "bankID_"+milliseconds},
    "beneficiaryIdentity": {
      "individualIdentity": {
        "name": {
          "familyName": "Smith",
          "givenNames": "John"
        },
        "address": {
          "addressLine1": "ABC",
          "addressLine2": "ABC",
          "addressLine3": "ABC",
          "city": "ABC",
          "country": "GB",
          "postcode": "EC1A 4HY",
          "province": "ABC"
        },
        "birthInformation": {
          "cityOfBirth": "ABC",
          "countryOfBirth": "GB",
          "dateOfBirth": "2001-01-01"
        },
        "identification": [
          {
            "idType": "Passport",
            "identificationCountry": "GB",
            "identificationNumber": "ABC123",
            "validFromDate": "2001-01-01",
            "validToDate": "2001-01-01"
          }
        ]
      },
     "additionalData": [
        {
          "key": "NATIONAL_ID_CARD",
          "value": "TT6789CC"
        }
      ]
    },
    "description": "Bank Account Description",
    "countryCode": "GB",
    "currencyCode": "GBP",
    "bankAccountDetails": [
      {
        "key": "accountNumber",
        "value": "06970093"
      },
      {
        "key": "accountName",
        "value": "account name"
      },
      {
        "key": "bankName",
        "value": "Test Bank"
      },
      {
        "key": "sortCode",
        "value": "800554"
      }
    ]
};
var Payment_request ={
  "transactionID": {
      "merchantTransactionID": "txID_"+milliseconds},
  "payoutRequestAmount": {
      "amount": 11,
      "currency": "GBP"
  },
  "beneficiaryAmountInformation": {
      "beneficiaryAmount": {
          "amount": 11,
          "currency": "GBP"
      },
      "payoutCurrency": "GBP"
  },
  "serviceLevel": "standard",
  "beneficiaryStatementNarrative": "Free Text Description",
  "fxTicketID": 0,
  "requestedFX": "FF",
  "payerType": "user",
  "payoutType": "NA",
  "payoutDetails": [{
          "key": "K1",
          "value": "V1"
      }, {
          "key": "K2",
          "value": "V2"
      }
  ]
};

//------------------------------------

//GENERATING TOKEN
describe('VPL Sandbox Testing Started', function() {
  it('Get access token', function(done) {

      supertest.agent("https://api-sandbox.earthport.com/oauth")
      .post('/token?grant_type=client_credentials')
      .set('Accept', 'application/json')
      .set('Authorization', 'Basic YkVaaWY5N3B5dEdxZm05SmUzaDJLU3ROenAwbjJzSWY6TFJiMGUxYUFJbVdrWUNnMQ==')
      .end(function(err,res){
          if (err) return done(err);
         
          else{
              expect(res.statusCode).to.equal(200);
              token = res.text.access_token;
              data = JSON.parse(res.text);
              access_token = data['access_token'];
              console.log("Access Token Generated :- "+access_token);
          }
          done();
      });
}).timeout(18000);

//CREATING USER
it('Create User ', (done)=> {
          supertest.agent("https://api-sandbox.earthport.com/v1")
         .set('Content-Type', 'application/json')
         .post("/users")
         .set('Authorization', 'Bearer ' + access_token).send(Create_User)
         .end(function(err, res) {
          if (err) return done(err);
          else{
          expect(res.statusCode).to.equal(200);
           this.response=res.text;
           data1= JSON.parse(response);
           epUserID = data1['epUserID'];
           console.log("User Created!!  UserID is :- "+epUserID);
          }          
          done();
       });
}).timeout(18000);

   
   //CREATING BENEFICIARY
   it('Bank Account', (done)=> {
      supertest.agent("https://api-sandbox.earthport.com/v1/")
    .set('Content-Type', 'application/json')
    .post("/users/"+epUserID+"/bank-accounts")
    .set('Authorization', 'Bearer ' + access_token).send(Create_ben)
    .end(function(err,res){
      if (err) return done(err);
          else{
          expect(res.statusCode).to.equal(200);
           response=res.text;
           data2= JSON.parse(response);
           epBankID = data2['benBankID']['epBankID'];
           console.log("Beneficiary Created!! Bank ID is :- "+epBankID);
          }
      done();
  });
}).timeout(18000);
    

//CREATE NEW PAYMENT
it('Create Payment ', (done)=> {
  supertest.agent("https://api-sandbox.earthport.com/v1")
 .set('Content-Type', 'application/json')
 .post("/users/"+epUserID+"/bank-accounts/"+epBankID+"/payments")
 .set('Authorization', 'Bearer ' + access_token).send(Payment_request)
 .end(function(err, res) {
  if (err) return done(err);
  else{
  expect(res.statusCode).to.equal(200);
   response=res.text;
   data3= JSON.parse(response);
   epTransactionID = data3['transactionID']['epTransactionID'];
   console.log("Payment Sussessful!! Transaction ID :- "+epTransactionID);
  }
  
  done();
});
}).timeout(18000);

//GET TRANSACTIONS
it('GET Payment ', (done)=> {
    supertest.agent("https://api-sandbox.earthport.com/v1")
   .get("/transactions/"+epTransactionID)
   .set('Authorization', 'Bearer ' + access_token)
   .end(function(err, res) {
    if (err) return done(err);
    else{
    expect(res.statusCode).to.equal(200);
     response=res.text;
     data4= JSON.parse(response);
     console.log("Get Transaction Details:- "+data4);
    }
    
    done();
  });
  }).timeout(18000);
});