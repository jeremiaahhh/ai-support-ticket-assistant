"""End-to-end API tests for ticket endpoints."""

from __future__ import annotations


def _payload(**overrides):
    base = {
        "subject": "Cannot log in after enabling 2FA",
        "body": "I enabled 2FA and now my codes are rejected. Locked out of my account.",
        "customer_email": "alex@example.com",
        "customer_name": "Alex",
    }
    base.update(overrides)
    return base


def test_health(client) -> None:
    response = client.get("/health")
    assert response.status_code == 200
    body = response.json()
    assert body["status"] == "ok"
    assert body["mock_mode"] is True


def test_create_and_get_ticket(client) -> None:
    created = client.post("/tickets", json=_payload()).json()
    assert created["status"] == "open"
    assert created["priority"] == "medium"

    fetched = client.get(f"/tickets/{created['id']}").json()
    assert fetched["id"] == created["id"]
    assert fetched["analysis"] is None


def test_list_tickets_with_filters(client) -> None:
    client.post("/tickets", json=_payload(subject="Billing question", body="Please refund duplicate invoice"))
    client.post("/tickets", json=_payload(subject="Outage", body="Production down — urgent, all users affected"))
    client.post("/tickets", json=_payload(subject="Minor typo", body="No rush, just a cosmetic typo on pricing page"))

    listing = client.get("/tickets").json()
    assert listing["total"] == 3
    assert len(listing["items"]) == 3

    search = client.get("/tickets", params={"search": "outage"}).json()
    assert search["total"] == 1


def test_analyze_ticket_returns_analysis(client) -> None:
    created = client.post(
        "/tickets",
        json=_payload(
            subject="Production outage",
            body="Production is down — all users affected, urgent.",
        ),
    ).json()

    analysis = client.post(f"/tickets/{created['id']}/analyze").json()
    assert analysis["category"] == "technical_issue"
    assert analysis["priority"] == "critical"
    assert analysis["used_mock"] is True
    assert 0.0 <= analysis["confidence_score"] <= 1.0


def test_analyze_is_idempotent_without_force(client) -> None:
    created = client.post("/tickets", json=_payload()).json()
    a = client.post(f"/tickets/{created['id']}/analyze").json()
    b = client.post(f"/tickets/{created['id']}/analyze").json()
    assert a["id"] == b["id"]

    c = client.post(f"/tickets/{created['id']}/analyze", json={"force": True}).json()
    assert c["id"] == a["id"]  # upsert keeps same row


def test_patch_status_and_priority(client) -> None:
    created = client.post("/tickets", json=_payload()).json()
    patched = client.patch(
        f"/tickets/{created['id']}", json={"status": "in_progress", "priority": "high"}
    ).json()
    assert patched["status"] == "in_progress"
    assert patched["priority"] == "high"


def test_unknown_ticket_returns_404(client) -> None:
    response = client.get("/tickets/does-not-exist")
    assert response.status_code == 404
    assert response.json()["error"]["code"] == "not_found"


def test_analytics_summary(client) -> None:
    client.post("/tickets", json=_payload(subject="Outage", body="Production down — urgent"))
    client.post("/tickets", json=_payload(subject="Billing", body="Refund duplicate invoice please"))

    summary = client.get("/analytics/summary").json()
    assert summary["total_tickets"] == 2
    assert "categories" in summary
    assert "priorities" in summary
