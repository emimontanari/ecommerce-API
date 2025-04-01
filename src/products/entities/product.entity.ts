import { BeforeInsert, BeforeUpdate, Column, Entity, ManyToOne, OneToMany, PrimaryGeneratedColumn } from "typeorm";
import { ProductImage } from "./product-image.entity";
import { User } from "src/auth/entities/user.entity";

@Entity({ name: 'product_images' })
export class Product {
    @PrimaryGeneratedColumn('uuid')
    id: string

    @Column('text', {
        unique: true
    })
    title: string
    @Column('float', {
        default: 0
    })
    price: number
    @Column({
        type: 'text',
        nullable: true
    })
    description: string

    @ManyToOne(
        () => User,
        (user) => user.product
    )
    user: User
    @Column('text', {
        unique: true
    })
    slug: string

    @Column('int', {
        default: 0
    })
    stock: number

    @Column('text', {
        array: true
    })
    sizes: string[]

    @Column('text')
    gender: string

    @Column('text', {
        array: true,
        default: []
    })
    tags: string[]

    //images
    @OneToMany(
        () => ProductImage,
        productImage => productImage.product,
        { cascade: true, eager: true }
    )
    images?: ProductImage[]

    @BeforeInsert()
    checkSlugInsert() {
        if (!this.slug) {
            this.slug = this.title.toLowerCase()
                .trim()
                .replace(/[^a-z0-9\s-']/g, '')
                .replace(/\s+/g, '-')
                .replace(/'+/g, '');
        }

        this.slug = this.slug.toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-']/g, '')
            .replace(/\s+/g, '-')
            .replace(/'+/g, '');
    }

    @BeforeUpdate()
    checkUpdate() {
        this.slug = this.slug.toLowerCase()
            .trim()
            .replace(/[^a-z0-9\s-']/g, '')
            .replace(/\s+/g, '-')
            .replace(/'+/g, '');
    }
}
