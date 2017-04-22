# WebDataCenter

## Setup

### Requirements

Please make sure that you have the following software up and running:

| Software                               | Reference                                                                                                                                                                                                                                                     |
|----------------------------------------|-------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------|
| Python > 3.5         | https://www.python.org/downloads/                          |
| Pip > 9.0                           | https://pypi.python.org/pypi/pip                                                                                                       |

### Get Started

Please make sure that you have [Python Flask](http://flask.pocoo.org/) installed. It will be used yor starting the application.

For the execution of the WebDataCenter and all its components, go into the PWA_Data_Center/app folder and execute the start_pwa.py script with python3. The WebDataCenter will be accessible under https://localhost:3000.

For setting up the exemple client applications just do the same steps as described before in the specific project folders. Health Client 1 would be hosted on port 5000 (https://localhost:5000) and Health Client 2 should be accessible under https://localhost:8000 in the standard configuration.

## Background

This prototype was developed within the scope of my bachelor thesis at the [Chair for Information and Service Systems](http://iss.uni-saarland.de/en/) at Saarland University.
The idea was the creation of a local datastorage infrastructure within a web browser without using any synch mechanisms transfering the data on a central server.

## Copyright and license

Copyright 2017 Mirco Pyrtek

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

   http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.