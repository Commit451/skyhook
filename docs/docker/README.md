## Running with Docker
To build the image:
```
docker build -t skyhook .
```
To run the application:
```
docker run -p 8080:8080 --name skyhook skyhook
```
To run the tests:
```
docker run --name skyhook skyhook npm test
```
To remove the created container:
```
docker rm skyhook
```