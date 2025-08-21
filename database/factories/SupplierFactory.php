<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Supplier>
 */
class SupplierFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'name' => $this->faker->company(),
            'contact_info' => json_encode([
                'phone' => $this->faker->phoneNumber(),
                'email' => $this->faker->companyEmail(),
                'address' => $this->faker->address(),
            ]),
            'is_active' => $this->faker->boolean(90),
        ];
    }
}