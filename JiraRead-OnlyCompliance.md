# Jira Read-Only Compliance Rule

This document establishes the mandatory safety protocol for any AI agent or automated script interacting with the Jira API for the Statik Canvas project.

## Mandatory Rule
**Access to the Jira API MUST be restricted to READ-ONLY operations.**

Under no circumstances should any operation be performed that modifies, creates, or deletes data within the Jira environment (Projects: OTE, SUP, OTM).

## Technical Implementation
1. **Methods Allowed**: `GET`
2. **Methods Prohibited**: `POST`, `PUT`, `PATCH`, `DELETE`
3. **Usage Pattern**: All Jira interactions for flow metrics calculation must use the `fetchJiraIssues` implementation in `src/lib/jira.ts`, which is strictly audited to only perform data retrieval.

## Audit Requirement
Before any changes to the `src/lib/jira.ts` or related network logic are committed, ensure that the "Read-Only" nature of the integration is preserved.

---
*Rule established on 13th April 2026 as per user requirement.*
