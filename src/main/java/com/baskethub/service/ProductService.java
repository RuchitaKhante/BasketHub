package com.baskethub.service;

import com.baskethub.entity.Product;
import com.baskethub.exception.ResourceNotFoundException;
import com.baskethub.repository.ProductRepository;
import org.springframework.stereotype.Service;
import java.util.List;

@Service
public class ProductService {

    private final ProductRepository repo;

    public ProductService(ProductRepository repo) {
        this.repo = repo;
    }

    public List<Product> getAll() {
        return repo.findAll();
    }

    public Product getById(Long id) {
        return repo.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found with id " + id));
    }

    public Product save(Product product) {
        return repo.save(product);
    }

    public Product update(Long id, Product updated) {
        Product existing = getById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setPrice(updated.getPrice());
        existing.setStock(updated.getStock());
        existing.setCategory(updated.getCategory());
        existing.setImageUrl(updated.getImageUrl());
        return repo.save(existing);
    }

    public void delete(Long id) {
        getById(id); // throws 404 if it doesn't exist
        repo.deleteById(id);
    }

    public List<Product> search(String keyword) {
        return repo.findByNameContainingIgnoreCase(keyword);
    }

    public List<Product> getByCategory(String category) {
        return repo.findByCategoryIgnoreCase(category);
    }
}