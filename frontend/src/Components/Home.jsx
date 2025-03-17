import React, { useEffect, useState } from "react";
import axios from "axios";
import { Container, Row, Col, Form, Card, Button } from "react-bootstrap";

function Home() {
  const [contests, setContests] = useState([]);
  const [platform, setPlatform] = useState("");

  useEffect(() => {
    fetchContests();
  }, [platform]);

  const fetchContests = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/contests?platform=${platform}`);
      setContests(response.data);
    } catch (error) {
      console.error("Error fetching contests:", error);
    }
  };

  return (
    <Container className="mt-4">
      <h1 className="text-center">Contest Tracker</h1>

      {/* Platform Filter */}
      <Row className="mb-3">
        <Col md={4} className="mx-auto">
          <Form.Select onChange={(e) => setPlatform(e.target.value)}>
            <option value="">All Platforms</option>
            <option value="Codeforces">Codeforces</option>
            <option value="CodeChef">CodeChef</option>
            <option value="Leetcode">Leetcode</option>
          </Form.Select>
        </Col>
      </Row>

      {/* Display Contests */}
      <Row>
        {contests.length > 0 ? (
          contests.map((contest) => (
            <Col md={4} key={contest._id} className="mb-4">
              <Card>
                <Card.Body>
                  <Card.Title>{contest.name}</Card.Title>
                  <Card.Subtitle className="mb-2 text-muted">{contest.platform}</Card.Subtitle>
                  <Card.Text>
                    <strong>Start Time:</strong> {new Date(contest.startTime).toLocaleString()} <br />
                    <strong>End Time:</strong> {new Date(contest.endTime).toLocaleString()}
                  </Card.Text>
                  <Button variant="primary" href={contest.url} target="_blank">
                    View Contest
                  </Button>
                </Card.Body>
              </Card>
            </Col>
          ))
        ) : (
          <p className="text-center">No contests found.</p>
        )}
      </Row>
    </Container>
  );
}

export default Home;
