class User
  include Mongoid::Document

  field :email
  field :name

  has_many :tasks
end