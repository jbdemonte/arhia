# Arhia

Arhia API client.

## Library content

Arhia library provides a few classes which embeds their enumerates.  
These classes are not usable as it, only theirs enumerates are.

```bash
> var Arhia = require('arhia');
> Arhia.Employee.Gender
{ MAN: 1, WOMAN: 2 }
```

Arhia class has to be instantiated to be used.  
The instance will enclose the connexion parameters and provide a set of classes usable which are children of the original ones including all __original__ enumerates.

```bash
> var employee = new arhia.Employee()
undefined
> employee instanceof arhia.Employee
true
> employee instanceof Arhia.Employee
true
> arhia.Employee === Arhia.Employee
true
> arhia.Employee.Gender
{ MAN: 1, WOMAN: 2 }
> Arhia.Employee.Gender
{ MAN: 1, WOMAN: 2 }
> Arhia.Employee.Gender === arhia.Employee.Gender
true
```


__All the code samples below deals with instance of arhia.__

___

This client provides a standardized set of property which is different of the official Arhia one.  
To help while integration, each class instance provide the `fields` function, a helper to retrieve this mapping.

`fields([pattern], [invert])`

```js
> var em = new arhia.Employee();
undefined
> em.fields()
id => sal_id
fake => sal_simul
firstname => sal_prenom
lastname => sal_nom_famille
...
```

## Instanciate client

```js
var Arhia = require('arhia');

var arhia = new Arhia({
  uri: 'http://api.url',
  dospayId: 0,
  versionAPI: 1,
  // your credentials: either username/password or token
  username: '', password: '',
  token: ''
});
```

`arhia` instance provides a few models which consumes Arhia API. 

Each Model embeds some static functions which are usable directly from the models and some methods wich are usable from the instances of the models. 
Both statics and methods handle promises and callback patterns.

### Arhia.BankAccount

Employee bank account

* `bic` 
* `default` - Either or not this bank account is the default to use for the employee
* `domiciliation` 
* `iban` 
* `owner`

### Arhia.Employee

* `addressCCpl` - 
* `addressCountryISOCode` - 
* `addressCpl` - 
* `address` - 
* `banks` - Arhia.BankAccount
* `birthCountryISOCode` - 
* `birthDate` - 
* `birthPlace` - 
* `city` - 
* `externalId` - Employee id in your application
* `fake` - Either or not the employee is a simulated one
* `firstname` - 
* `gender` - Arhia.Employee.Gender - Man or Woman (1 / 2)
* `id` - Arhia index set when saved (would not be manually set)
* `lastname` - 
* `maidenName` - 
* `nationalityISOCode` - 
* `nir` - 
* `observation` - 
* `paymentMode` - Employee.PaymentMode
* `postalCode` - 
* `registrationNumber` - 

#### Arhia.Employee.Gender

* `MAN` - 1
* `WOMAN` - 1

#### Arhia.Employee.PaymentMode

* `CHEQUE` - 'CHQ'
* `TRANSFER` - 'VIR'
* `CASH` - 'ESP'

#### Arhia.Employee.findById(externalId, [callback])

Static function to retrieve an employee from the Arhia platform.

```js
arhia.Employee
  .findById('507e1f77bcf86cd699439011')
  .then(function (employee) {
    console.log(employee ? employee.name : '!Unknown user');
  })
  .catch(function (reason) {
    console.log(reason);
  });

```

#### Arhia.Employee.prototype.create([callback])

Function to save a __new__ employee on the Arhia platform.

```js
var em = new arhia.Employee();
// ...
em
  .create()
  .then(function (result) {
    console.log(result);
  })
  .catch(function (reason) {
    console.log(reason);
  });
```

#### Arhia.Employee.prototype.update([callback])

Function to update an __existing__ employee on the Arhia platform