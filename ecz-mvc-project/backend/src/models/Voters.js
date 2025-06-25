class Voter {
    constructor({ firstName, lastName, nrc, ward, constituency, email, id, passwordHash }) {
        this.firstName = firstName;
        this.lastName = lastName;
        this.nrc = nrc;
        this.ward = ward;
        this.constituency = constituency;
        this.email = email;
        this.id = id;
        this.passwordHash = passwordHash;
    }
}

module.exports =