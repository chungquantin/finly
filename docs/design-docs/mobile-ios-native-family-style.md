# Mobile iOS Native Family Style

## Status

Active

## Context

This document defines the current mobile visual direction for Finly: iOS-native, clean, and wallet-first, inspired by Family/Pocket-style patterns.

## Core UI Principles

- Use light iOS grouped backgrounds (`#F2F2F7`) with white cards.
- Keep visual density low; prefer whitespace and simple separators over heavy shadows.
- Use floating navigation surfaces (tab bar and contextual controls) with rounded corners.
- Keep interactive elements large and obvious (44pt+ target, rounded pills for primary actions).

## Navigation Model

- Status bar remains visible and uncluttered.
- Top navigation uses floating controls and centered titles.
- Bottom tab bar is a floating rounded container, not pinned to bezels.
- Use modal-like cards and grouped lists for settings and management screens.

## Typography

- Prefer iOS-native scale and rhythm:
  - Large title: 34pt
  - Section title: 24-28pt
  - Body: 17pt
  - Metadata: 13pt
- Keep emphasis to weight and spacing, not decorative effects.

## Color

- Background: `#F2F2F7`
- Card: `#FFFFFF`
- Primary text: `#111111`
- Secondary text: `#8E8E93`
- Positive action: `#34C759`
- Destructive action: `#FF3B30`
- Accent should be limited and functional (2-3 colors max in a screen).

## Interaction Guidance

- Prefer native-feeling toggles, segmented pills, list rows, and sheet-like card groups.
- Use subtle motion only for feedback and transitions.
- Ensure all translucent/soft backgrounds preserve text contrast.

## Accessibility Baseline

- Maintain high text contrast against white and grouped backgrounds.
- Keep minimum touch target sizes at 44x44.
- Avoid color-only meaning for critical state.
- Ensure readable text scale at default iOS body size (17pt).
