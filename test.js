const grpc = require('grpc')
function main() {
	let proto = grpc.load(__dirname + '/protos/test.proto').test
	var client = new proto.Test('localhost:50051',
										 grpc.credentials.createInsecure());
	// console.log(client)
	client.check({data: 'you'}, function(err, response) {
		if (err) return console.error(err.stack)
	  console.log('Greeting:', response);
	});
  }

main()


