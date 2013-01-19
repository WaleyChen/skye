class Task
  include Mongoid::Document

  field :name
  field :description
  field :start
  field :end
  field :duration
  field :splittable

  belongs_to :user
end