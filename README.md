# QED Scripts - Interactive Mathematical Elements

This repository contains interactive JavaScript classes and simulations created for the QED UAM student mathematics magazine. These scripts bring mathematical concepts to life through engaging visualizations, puzzles, and interactive demonstrations.

## About QED UAM

QED is a student association from the Autonomous University of Madrid (UAM) focused on creating a mathematical outreach magazine. The name "QED" comes from the Latin phrase "Quod Erat Demonstrandum" (which was to be demonstrated), traditionally used at the end of mathematical proofs.

## Repository Structure

The repository is organized by magazine editions, each containing themed collections of interactive elements:

- **[Magazine 1 (2021-22)](./Magazine%201/)** - Interactive elements for the first edition
- **[Magazine 2 (2022-23)](./Magazine%202/)** - Interactive elements for the second edition

## Usage

Each interactive element is implemented as a JavaScript class with a standardized interface:

```javascript
class InteractiveElement {
    async start(container, params, savedState) {
        // Initialize the element with given parameters
    }
    
    async main() {
        // Animation loop (if applicable)
    }
}
```

## Magazine Links

- [QED Magazine Edition 2021-22 (Magazine 1)](https://qed.mat.uam.es/revista/2021-22) - *First edition*
- [QED Magazine Edition 2022-23 (Magazine 2)](https://qed.mat.uam.es/revista/2022-23) - *Second edition*
- [QED UAM Official Website](https://qed.mat.uam.es/) - *Main association website*

## Contributing

These scripts were created as part of the QED UAM student magazine project. For questions about the mathematical content or implementation, please contact the QED UAM association.